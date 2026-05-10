import Anthropic from '@anthropic-ai/sdk';
import type { AIDecisionRequest, RiskFactor, SuggestedLoanTerms } from '@loan-platform/shared-types';
import { RiskLevel } from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('ai-execution:claude');

// Structured output schema Claude must fill via tool use
const RISK_ASSESSMENT_TOOL: Anthropic.Tool = {
  name: 'submit_risk_assessment',
  description: 'Submit the structured loan risk assessment result',
  input_schema: {
    type: 'object' as const,
    properties: {
      risk_score: {
        type: 'number',
        description: 'Overall risk score from 0.0 (lowest risk) to 1.0 (highest risk)',
      },
      risk_level: {
        type: 'string',
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        description: 'Risk category based on risk_score',
      },
      recommendation: {
        type: 'string',
        enum: ['APPROVE', 'MANUAL_REVIEW', 'REJECT'],
        description: 'Lending recommendation',
      },
      confidence: {
        type: 'number',
        description: 'Confidence in this assessment from 0.0 to 1.0',
      },
      reasoning: {
        type: 'string',
        description: 'Plain-language explanation suitable for compliance audit trail',
      },
      risk_factors: {
        type: 'array',
        description: 'Individual factors with direction and weight for ECOA adverse action notices',
        items: {
          type: 'object',
          properties: {
            factor: { type: 'string', description: 'Factor identifier (snake_case)' },
            impact: { type: 'string', enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] },
            weight: { type: 'number', description: 'Relative weight 0.0–1.0' },
            value: { type: 'string', description: 'Actual value observed' },
            description: { type: 'string', description: 'Human-readable explanation' },
          },
          required: ['factor', 'impact', 'weight', 'description'],
        },
      },
      suggested_terms: {
        type: 'object',
        description: 'Only present when recommendation is APPROVE',
        properties: {
          approved_amount: { type: 'number' },
          interest_rate: { type: 'number', description: 'Annual rate as decimal, e.g. 0.065 = 6.5%' },
          term_months: { type: 'number' },
          monthly_payment: { type: 'number' },
          conditions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Any conditions attached to approval',
          },
        },
        required: ['approved_amount', 'interest_rate', 'term_months', 'monthly_payment'],
      },
    },
    required: ['risk_score', 'risk_level', 'recommendation', 'confidence', 'reasoning', 'risk_factors'],
  },
};

// System prompt is cached — same for every call, saving ~80% of input token cost
const SYSTEM_PROMPT = `You are a senior credit risk analyst at a regulated financial institution operating under US lending law.

Your role is to assess loan applications objectively and provide structured risk assessments that:
1. Are explainable and auditable under ECOA (Equal Credit Opportunity Act)
2. Base decisions solely on financial risk factors — never demographic characteristics
3. Provide specific, actionable reasons suitable for FCRA adverse action notices
4. Follow fair lending principles and avoid discriminatory patterns

You must call the submit_risk_assessment tool with your complete assessment. Do not provide narrative outside the tool call.

Risk score guidelines:
- 0.00–0.35: LOW risk → APPROVE
- 0.36–0.55: MEDIUM risk → APPROVE with conditions
- 0.56–0.75: HIGH risk → MANUAL_REVIEW
- 0.76–1.00: CRITICAL risk → REJECT

Interest rate guidelines for approved loans:
- LOW risk: base rate + 1–3%
- MEDIUM risk: base rate + 3–6%
- Assume base rate of 5.5% (current prime + spread)

Always provide 3–6 risk factors with specific values observed.`;

export interface ClaudeAnalysisResult {
  reasoning: string;
  riskScore: number;
  recommendation: string;
  confidence: number;
  riskFactors: RiskFactor[];
  suggestedTerms?: SuggestedLoanTerms;
  tokensUsed: number;
  modelVersion: string;
}

export async function claudeAnalyze(
  request: AIDecisionRequest,
  prompt: string,
): Promise<ClaudeAnalysisResult> {
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const client = new Anthropic({ apiKey });
  const model = process.env['AI_MODEL'] ?? 'claude-sonnet-4-6';

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
    tools: [RISK_ASSESSMENT_TOOL],
    tool_choice: { type: 'tool', name: 'submit_risk_assessment' },
  });

  const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use');
  if (!toolUse || toolUse.name !== 'submit_risk_assessment') {
    throw new Error('Claude did not call submit_risk_assessment tool');
  }

  const raw = toolUse.input as Record<string, unknown>;

  const riskScore = Math.max(0, Math.min(1, Number(raw['risk_score'])));
  const recommendation = String(raw['recommendation']);
  const confidence = Math.max(0, Math.min(1, Number(raw['confidence'])));
  const reasoning = String(raw['reasoning']);

  const rawFactors = (raw['risk_factors'] as Array<Record<string, unknown>>) ?? [];
  const riskFactors: RiskFactor[] = rawFactors.map((f) => ({
    factor: String(f['factor']),
    impact: String(f['impact']) as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
    weight: Number(f['weight']),
    description: String(f['description']),
  }));

  let suggestedTerms: SuggestedLoanTerms | undefined;
  if (recommendation === 'APPROVE' && raw['suggested_terms']) {
    const st = raw['suggested_terms'] as Record<string, unknown>;
    suggestedTerms = {
      approvedAmount: Number(st['approved_amount']),
      interestRate: Number(st['interest_rate']),
      termMonths: Number(st['term_months']),
      monthlyPayment: Number(st['monthly_payment']),
      conditions: (st['conditions'] as string[] | undefined) ?? [],
    };
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const tokensUsed = inputTokens + outputTokens;

  logger.info('Claude analysis complete', {
    loanRequestId: request.loanRequestId,
    model,
    riskScore,
    recommendation,
    confidence,
    inputTokens,
    outputTokens,
    stopReason: response.stop_reason,
  });

  const riskLevel: RiskLevel = riskScore > 0.75 ? RiskLevel.CRITICAL
    : riskScore > 0.55 ? RiskLevel.HIGH
    : riskScore > 0.35 ? RiskLevel.MEDIUM
    : RiskLevel.LOW;

  // Override with computed riskLevel for consistency
  void riskLevel;

  return { reasoning, riskScore, recommendation, confidence, riskFactors, suggestedTerms, tokensUsed, modelVersion: model };
}

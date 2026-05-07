import type { Client as MinioClient } from 'minio';
import { randomUUID } from 'crypto';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('ai-execution:prompt-manager');

const ACTIVE_PROMPT_VERSION = '1.2.0';

const PROMPT_TEMPLATES: Record<string, string> = {
  '1.2.0': `You are a senior credit risk analyst at a regulated financial institution.

Analyze the following loan application and provide a structured risk assessment.

# Applicant Profile
- Credit Score: {{creditScore}}
- Annual Income: ${{annualIncome}}
- Existing Debt: ${{existingDebt}}
- Employment Status: {{employmentStatus}}
- Age: {{age}}
- KYC Verified: {{kycVerified}}

# Loan Request
- Type: {{loanType}}
- Amount: ${{requestedAmount}}
- Term: {{termMonths}} months
- Purpose: {{purpose}}
- Debt-to-Income Ratio: {{dtiRatio}}%

# Risk Signals
- Fraud Score: {{fraudScore}}
- Policy Flags: {{policyFlags}}

# Instructions
Provide:
1. Overall risk score (0.0-1.0, where 1.0 = highest risk)
2. Risk level (LOW/MEDIUM/HIGH/CRITICAL)
3. Recommendation (APPROVE/MANUAL_REVIEW/REJECT)
4. Confidence score (0.0-1.0)
5. Key risk factors with impact (POSITIVE/NEGATIVE/NEUTRAL) and weight
6. If APPROVE: suggested loan terms with interest rate
7. Plain-language reasoning for compliance audit trail

Your assessment must be objective, explainable, and free of bias.
Base decisions solely on financial risk factors, not demographic characteristics.`,

  '1.1.0': `[Deprecated] Loan risk analysis prompt v1.1.0`,
};

export class PromptManager {
  constructor(private readonly minioClient: MinioClient) {}

  getActiveVersion(): string {
    return process.env['ACTIVE_PROMPT_VERSION'] ?? ACTIVE_PROMPT_VERSION;
  }

  buildPrompt(version: string, variables: Record<string, string | number | boolean>): string {
    const template = PROMPT_TEMPLATES[version];
    if (!template) throw new Error(`Prompt version ${version} not found`);

    return Object.entries(variables).reduce(
      (prompt, [key, value]) => prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
      template
    );
  }

  async storePrompt(version: string, content: string, loanRequestId: string): Promise<string> {
    const key = `${loanRequestId}/prompt-${version}-${Date.now()}.txt`;
    try {
      await this.minioClient.putObject(
        process.env['MINIO_BUCKET_PROMPTS'] ?? 'ai-prompts',
        key,
        Buffer.from(content),
        { 'Content-Type': 'text/plain', 'X-Prompt-Version': version, 'X-Loan-Request-Id': loanRequestId }
      );
    } catch (err) {
      logger.warn('Failed to store prompt in MinIO', { err, key });
    }
    return key;
  }

  async storeResponse(response: unknown, loanRequestId: string): Promise<string> {
    const key = `${loanRequestId}/response-${Date.now()}.json`;
    try {
      await this.minioClient.putObject(
        process.env['MINIO_BUCKET_RESPONSES'] ?? 'ai-responses',
        key,
        Buffer.from(JSON.stringify(response, null, 2)),
        { 'Content-Type': 'application/json', 'X-Loan-Request-Id': loanRequestId }
      );
    } catch (err) {
      logger.warn('Failed to store AI response in MinIO', { err, key });
    }
    return key;
  }
}

import { NodeExecutor } from '../node-executor.js';
import { DecisionNode } from '../../domain/decision-flow.entity.js';
import {
  DecisionNodeType,
  NodeExecutionStatus,
  type ExecutionContext,
  type ConditionNodeConfig,
  type RuleNodeConfig,
  type ScoreNodeConfig,
} from '../../common/types.js';
import { NodeExecutionError, NodeTimeoutError } from '../../common/errors.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNode(overrides: Partial<ConstructorParameters<typeof DecisionNode>[0]>): DecisionNode {
  return new DecisionNode({
    id: 'node-1',
    flowId: 'flow-1',
    tenantId: 'tenant-1',
    name: 'Test Node',
    type: DecisionNodeType.START,
    config: {},
    branches: [],
    timeoutMs: 5000,
    retryAttempts: 0,
    retryDelayMs: 100,
    positionX: 0,
    positionY: 0,
    ...overrides,
  });
}

function makeCtx(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    executionId: 'exec-1',
    tenantId: 'tenant-1',
    flowId: 'flow-1',
    correlationId: 'corr-1',
    traceId: 'trace-1',
    input: {},
    nodeOutputs: {},
    initiatedBy: 'user-1',
    initiatedByType: 'USER',
    startedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMocks() {
  const policyEvaluator = {
    evaluateSinglePolicy: jest.fn().mockResolvedValue({
      passed: true,
      hard_block: false,
      violations: [],
      flags: [],
    }),
  };
  const aiClient = {
    reason: jest.fn().mockResolvedValue({
      requestId: 'req-1',
      riskScore: 0.4,
      confidence: 0.85,
      recommendation: 'APPROVE',
      reasoning: 'Low risk',
      riskFactors: [],
      suggestedTerms: {},
      modelVersion: 'test',
      tokensUsed: 100,
      latencyMs: 50,
    }),
  };
  const confidenceScorer = { score: jest.fn() };
  return { policyEvaluator, aiClient, confidenceScorer };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NodeExecutor', () => {
  let executor: NodeExecutor;
  let mocks: ReturnType<typeof makeMocks>;

  beforeEach(() => {
    mocks = makeMocks();
    executor = new NodeExecutor(
      mocks.policyEvaluator as never,
      mocks.aiClient as never,
      mocks.confidenceScorer as never,
    );
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── START / END nodes ──────────────────────────────────────────────────────

  it('executes START node and returns started:true', async () => {
    const node = makeNode({ type: DecisionNodeType.START });
    const result = await executor.execute(node, makeCtx(), 'trace-1');
    expect(result.status).toBe(NodeExecutionStatus.COMPLETED);
    expect(result.output['started']).toBe(true);
  });

  it('executes END node and includes context finalDecision', async () => {
    const node = makeNode({ type: DecisionNodeType.END });
    const ctx = makeCtx({ finalDecision: 'APPROVE' });
    const result = await executor.execute(node, ctx, 'trace-1');
    expect(result.output['finalDecision']).toBe('APPROVE');
  });

  // ── CONDITION node branch resolution ──────────────────────────────────────

  it('CONDITION node resolves trueBranchNodeId when expression is true', async () => {
    const cfg: ConditionNodeConfig = {
      expression: 'riskScore < 0.5',
      trueBranchNodeId: 'node-true',
      falseBranchNodeId: 'node-false',
    };
    const node = makeNode({ type: DecisionNodeType.CONDITION, config: cfg, nextNodeId: 'node-default' });
    const ctx = makeCtx({ riskScore: 0.3 });

    const result = await executor.execute(node, ctx, 'trace-1');
    expect(result.output['result']).toBe(true);
    expect(result.output['selectedNodeId']).toBe('node-true');
    expect(result.nextNodeId).toBe('node-true');
  });

  it('CONDITION node resolves falseBranchNodeId when expression is false', async () => {
    const cfg: ConditionNodeConfig = {
      expression: 'riskScore < 0.5',
      trueBranchNodeId: 'node-true',
      falseBranchNodeId: 'node-false',
    };
    const node = makeNode({ type: DecisionNodeType.CONDITION, config: cfg });
    const ctx = makeCtx({ riskScore: 0.8 });

    const result = await executor.execute(node, ctx, 'trace-1');
    expect(result.output['result']).toBe(false);
    expect(result.nextNodeId).toBe('node-false');
  });

  it('CONDITION node blocks unsafe expression and defaults to false', async () => {
    const cfg: ConditionNodeConfig = {
      expression: 'process.exit(1)',
      trueBranchNodeId: 'node-true',
      falseBranchNodeId: 'node-false',
    };
    const node = makeNode({ type: DecisionNodeType.CONDITION, config: cfg });
    const result = await executor.execute(node, makeCtx(), 'trace-1');
    expect(result.output['result']).toBe(false);
    expect(result.nextNodeId).toBe('node-false');
  });

  // ── RULE node hard-block detection ─────────────────────────────────────────

  it('RULE node sets nextNodeId to fallbackNodeId on hard block', async () => {
    mocks.policyEvaluator.evaluateSinglePolicy.mockResolvedValue({
      passed: false,
      hard_block: true,
      violations: ['MAX_DTI_EXCEEDED'],
      flags: [],
    });

    const cfg: RuleNodeConfig = { policyPath: 'loan/dti' };
    const node = makeNode({
      type: DecisionNodeType.RULE,
      config: cfg,
      nextNodeId: 'node-next',
      fallbackNodeId: 'node-reject',
    });

    const result = await executor.execute(node, makeCtx(), 'trace-1');
    expect(result.output['hardBlock']).toBe(true);
    expect(result.output['decision']).toBe('HARD_DENY');
    expect(result.nextNodeId).toBe('node-reject');
  });

  it('RULE node uses nextNodeId when policy passes', async () => {
    const cfg: RuleNodeConfig = { policyPath: 'loan/dti' };
    const node = makeNode({
      type: DecisionNodeType.RULE,
      config: cfg,
      nextNodeId: 'node-next',
      fallbackNodeId: 'node-reject',
    });

    const result = await executor.execute(node, makeCtx(), 'trace-1');
    expect(result.output['passed']).toBe(true);
    expect(result.nextNodeId).toBe('node-next');
  });

  // ── SCORE node threshold decision ──────────────────────────────────────────

  it('SCORE node returns APPROVE when riskScore is below APPROVE threshold', async () => {
    const cfg: ScoreNodeConfig = {
      thresholds: { APPROVE: 0.4, REJECT: 0.7 },
    };
    const node = makeNode({ type: DecisionNodeType.SCORE, config: cfg });
    const result = await executor.execute(node, makeCtx({ riskScore: 0.3 }), 'trace-1');
    expect(result.output['decision']).toBe('APPROVE');
  });

  it('SCORE node returns REJECT when riskScore is above REJECT threshold', async () => {
    const cfg: ScoreNodeConfig = {
      thresholds: { APPROVE: 0.4, REJECT: 0.7 },
    };
    const node = makeNode({ type: DecisionNodeType.SCORE, config: cfg });
    const result = await executor.execute(node, makeCtx({ riskScore: 0.85 }), 'trace-1');
    expect(result.output['decision']).toBe('REJECT');
  });

  it('SCORE node returns MANUAL_REVIEW when riskScore is between thresholds', async () => {
    const cfg: ScoreNodeConfig = {
      thresholds: { APPROVE: 0.4, REJECT: 0.7 },
    };
    const node = makeNode({ type: DecisionNodeType.SCORE, config: cfg });
    const result = await executor.execute(node, makeCtx({ riskScore: 0.55 }), 'trace-1');
    expect(result.output['decision']).toBe('MANUAL_REVIEW');
  });

  // ── APPROVAL / HUMAN_REVIEW pause signal ───────────────────────────────────

  it('APPROVAL node returns requiresApproval:true without calling external services', async () => {
    const node = makeNode({ type: DecisionNodeType.APPROVAL, config: { assignedRole: 'UNDERWRITER' } });
    const result = await executor.execute(node, makeCtx(), 'trace-1');
    expect(result.output['requiresApproval']).toBe(true);
    expect(mocks.policyEvaluator.evaluateSinglePolicy).not.toHaveBeenCalled();
  });

  // ── Retry behavior ─────────────────────────────────────────────────────────

  it('retries failing node up to retryAttempts before throwing', async () => {
    mocks.policyEvaluator.evaluateSinglePolicy.mockRejectedValue(new Error('OPA unavailable'));
    const cfg: RuleNodeConfig = { policyPath: 'loan/credit' };
    const node = makeNode({
      type: DecisionNodeType.RULE,
      config: cfg,
      retryAttempts: 2,
      retryDelayMs: 1,
    });

    await expect(executor.execute(node, makeCtx(), 'trace-1')).rejects.toThrow(NodeExecutionError);
    // Initial call + 2 retries = 3 total
    expect(mocks.policyEvaluator.evaluateSinglePolicy).toHaveBeenCalledTimes(3);
  });

  it('uses fallbackNodeId when retries are exhausted and fallback exists', async () => {
    mocks.policyEvaluator.evaluateSinglePolicy.mockRejectedValue(new Error('OPA unavailable'));
    const cfg: RuleNodeConfig = { policyPath: 'loan/credit' };
    const node = makeNode({
      type: DecisionNodeType.RULE,
      config: cfg,
      retryAttempts: 1,
      retryDelayMs: 1,
      fallbackNodeId: 'node-fallback',
    });

    const result = await executor.execute(node, makeCtx(), 'trace-1');
    expect(result.status).toBe(NodeExecutionStatus.FAILED);
    expect(result.output['usedFallback']).toBe(true);
    expect(result.nextNodeId).toBe('node-fallback');
  });

  // ── Trace entry ────────────────────────────────────────────────────────────

  it('buildTraceEntry produces valid trace entry', () => {
    const node = makeNode({ type: DecisionNodeType.START });
    const fakeResult = {
      nodeId: node.id,
      status: NodeExecutionStatus.COMPLETED,
      output: { started: true },
      durationMs: 42,
      retryCount: 0,
    };
    const startedAt = new Date();
    const entry = executor.buildTraceEntry(node, fakeResult, startedAt);
    expect(entry.nodeId).toBe(node.id);
    expect(entry.nodeType).toBe(DecisionNodeType.START);
    expect(entry.status).toBe(NodeExecutionStatus.COMPLETED);
    expect(entry.durationMs).toBe(42);
    expect(entry.retryCount).toBe(0);
  });
});

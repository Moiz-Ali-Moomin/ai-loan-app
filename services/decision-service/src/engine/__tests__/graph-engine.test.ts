import { GraphEngine } from '../graph-engine.js';
import { NodeExecutor } from '../node-executor.js';
import { DecisionFlow } from '../../domain/decision-flow.entity.js';
import { DecisionExecution } from '../../domain/decision-execution.entity.js';
import { DecisionNode } from '../../domain/decision-flow.entity.js';
import {
  DecisionNodeType,
  FlowStatus,
  ExecutionStatus,
  NodeExecutionStatus,
} from '../../common/types.js';
import { FlowNotPublishedError } from '../../common/errors.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNode(
  id: string,
  type: DecisionNodeType,
  overrides: Partial<ConstructorParameters<typeof DecisionNode>[0]> = {},
): DecisionNode {
  return new DecisionNode({
    id,
    flowId: 'flow-1',
    tenantId: 'tenant-1',
    name: `${type} node`,
    type,
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

function makeFlow(nodes: DecisionNode[], status = FlowStatus.PUBLISHED): DecisionFlow {
  return new DecisionFlow({
    id: 'flow-1',
    tenantId: 'tenant-1',
    name: 'Test Flow',
    version: '1.0.0',
    status,
    createdBy: 'user-1',
    metadata: {},
    tags: [],
    nodes,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeExecution(overrides: Partial<ConstructorParameters<typeof DecisionExecution>[0]> = {}): DecisionExecution {
  return new DecisionExecution({
    id: 'exec-1',
    tenantId: 'tenant-1',
    flowId: 'flow-1',
    status: ExecutionStatus.RUNNING,
    input: {},
    executionTrace: [],
    correlationId: 'corr-1',
    initiatedBy: 'user-1',
    initiatedByType: 'USER',
    createdAt: new Date(),
    ...overrides,
  });
}

function makeNodeExecutorMock(
  outputs: Record<string, Record<string, unknown>> = {},
  nextNodeIds: Record<string, string | undefined> = {},
): jest.Mocked<NodeExecutor> {
  const mock = {
    execute: jest.fn().mockImplementation(async (node: DecisionNode) => {
      const output = outputs[node.id] ?? { executed: true };
      return {
        nodeId: node.id,
        status: NodeExecutionStatus.COMPLETED,
        output,
        nextNodeId: nextNodeIds[node.id],
        durationMs: 5,
        retryCount: 0,
      };
    }),
    buildTraceEntry: jest.fn().mockImplementation((node: DecisionNode, result: { durationMs: number; status: NodeExecutionStatus; output: Record<string, unknown>; retryCount: number }) => ({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      status: result.status,
      durationMs: result.durationMs,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      output: result.output,
      retryCount: result.retryCount,
    })),
  } as unknown as jest.Mocked<NodeExecutor>;
  return mock;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GraphEngine', () => {
  // ── Unpublished flow guard ─────────────────────────────────────────────────

  it('throws FlowNotPublishedError for DRAFT flows', async () => {
    const nodes = [
      makeNode('start', DecisionNodeType.START, { nextNodeId: 'end' }),
      makeNode('end', DecisionNodeType.END),
    ];
    const flow = makeFlow(nodes, FlowStatus.DRAFT);
    const execution = makeExecution();
    const engine = new GraphEngine(makeNodeExecutorMock() as never);

    await expect(engine.execute(flow, execution, 'trace-1')).rejects.toThrow(FlowNotPublishedError);
  });

  // ── Simple linear traversal ────────────────────────────────────────────────

  it('traverses START → END and returns a completed result', async () => {
    const nodes = [
      makeNode('start', DecisionNodeType.START, { nextNodeId: 'end' }),
      makeNode('end', DecisionNodeType.END),
    ];
    const flow = makeFlow(nodes);
    const execution = makeExecution();
    const nodeExecutor = makeNodeExecutorMock(
      { end: { finalDecision: 'APPROVE', riskScore: 0.3, confidence: 0.9, completedAt: '' } },
      { start: 'end' },
    );
    const engine = new GraphEngine(nodeExecutor as never);

    const result = await engine.execute(flow, execution, 'trace-1');
    expect(result.requiresApproval).toBe(false);
    expect(result.executionId).toBe('exec-1');
    // START + END = 2 execute calls
    expect(nodeExecutor.execute).toHaveBeenCalledTimes(2);
  });

  // ── Approval gate early return ─────────────────────────────────────────────

  it('returns requiresApproval:true when traversal hits an APPROVAL node', async () => {
    const nodes = [
      makeNode('start', DecisionNodeType.START, { nextNodeId: 'approval' }),
      makeNode('approval', DecisionNodeType.APPROVAL, { nextNodeId: 'end' }),
      makeNode('end', DecisionNodeType.END),
    ];
    const flow = makeFlow(nodes);
    const execution = makeExecution();
    const nodeExecutor = makeNodeExecutorMock({}, { start: 'approval' });
    const engine = new GraphEngine(nodeExecutor as never);

    const result = await engine.execute(flow, execution, 'trace-1');
    expect(result.requiresApproval).toBe(true);
    expect(result.approvalNodeId).toBe('approval');
    // Should stop at approval, not proceed to execute it
    expect(nodeExecutor.execute).toHaveBeenCalledTimes(1); // only START
  });

  // ── Cycle detection ────────────────────────────────────────────────────────

  it('detects cycles and stops traversal without infinite loop', async () => {
    const nodes = [
      makeNode('start', DecisionNodeType.START, { nextNodeId: 'a' }),
      makeNode('a', DecisionNodeType.ACTION, { nextNodeId: 'b', config: { actionType: 'NOTIFY' } }),
      makeNode('b', DecisionNodeType.ACTION, { nextNodeId: 'a', config: { actionType: 'NOTIFY' } }), // cycle back to a
      makeNode('end', DecisionNodeType.END),
    ];
    const flow = makeFlow(nodes);
    const execution = makeExecution();
    const nodeExecutor = makeNodeExecutorMock(
      {},
      { start: 'a', a: 'b', b: 'a' },
    );
    const engine = new GraphEngine(nodeExecutor as never);

    // Should complete without hanging; cycle detection breaks the loop
    const result = await engine.execute(flow, execution, 'trace-1');
    // Graph terminates due to cycle detection — no infinite loop
    expect(result).toBeDefined();
    expect(nodeExecutor.execute.mock.calls.length).toBeLessThanOrEqual(nodes.length * 2 + 1);
  });

  // ── Fallback on node failure ───────────────────────────────────────────────

  it('routes to fallbackNodeId when a node throws and fallback is defined', async () => {
    const nodes = [
      makeNode('start', DecisionNodeType.START, { nextNodeId: 'rule' }),
      makeNode('rule', DecisionNodeType.RULE, {
        config: { policyPath: 'loan/dti' },
        nextNodeId: 'end',
        fallbackNodeId: 'fallback',
      }),
      makeNode('fallback', DecisionNodeType.END),
      makeNode('end', DecisionNodeType.END),
    ];
    const flow = makeFlow(nodes);
    const execution = makeExecution();

    const nodeExecutor = {
      execute: jest.fn().mockImplementation(async (node: DecisionNode) => {
        if (node.id === 'rule') throw new Error('OPA timeout');
        return {
          nodeId: node.id,
          status: NodeExecutionStatus.COMPLETED,
          output: { finalDecision: 'MANUAL_REVIEW', riskScore: 0, confidence: 0, completedAt: '' },
          nextNodeId: undefined,
          durationMs: 5,
          retryCount: 0,
        };
      }),
      buildTraceEntry: jest.fn().mockReturnValue({
        nodeId: 'fallback',
        nodeName: 'fallback',
        nodeType: DecisionNodeType.END,
        status: NodeExecutionStatus.COMPLETED,
        durationMs: 5,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        output: {},
        retryCount: 0,
      }),
    };

    const engine = new GraphEngine(nodeExecutor as never);
    const result = await engine.execute(flow, execution, 'trace-1');

    // Should use the fallback path, not throw
    expect(result).toBeDefined();
    // fallback node was visited after the rule node threw
    const calledIds = (nodeExecutor.execute as jest.Mock).mock.calls.map(
      (args: [DecisionNode]) => args[0].id
    );
    expect(calledIds).toContain('fallback');
  });

  // ── Context merging from RULE hard block ───────────────────────────────────

  it('merges RULE hard-block output into finalDecision=REJECT via mergeOutputIntoContext', async () => {
    const nodes = [
      makeNode('start', DecisionNodeType.START, { nextNodeId: 'rule' }),
      makeNode('rule', DecisionNodeType.RULE, {
        config: { policyPath: 'loan/fraud' },
        nextNodeId: 'end',
      }),
      makeNode('end', DecisionNodeType.END),
    ];
    const flow = makeFlow(nodes);
    const execution = makeExecution();

    const nodeExecutor = makeNodeExecutorMock(
      {
        rule: { passed: false, hardBlock: true, violations: ['FRAUD_FLAG'], decision: 'HARD_DENY' },
        end: { finalDecision: 'REJECT', riskScore: 0, confidence: 0, completedAt: '' },
      },
      { start: 'rule', rule: 'end' },
    );
    const engine = new GraphEngine(nodeExecutor as never);

    const result = await engine.execute(flow, execution, 'trace-1');
    expect(result.finalDecision).toBe('REJECT');
    expect(result.requiresApproval).toBe(false);
  });

  // ── AI node merges riskScore into context ──────────────────────────────────

  it('merges AI node riskScore into context for SCORE node', async () => {
    const nodes = [
      makeNode('start', DecisionNodeType.START, { nextNodeId: 'ai' }),
      makeNode('ai', DecisionNodeType.AI, { config: { decisionType: 'CREDIT' }, nextNodeId: 'end' }),
      makeNode('end', DecisionNodeType.END),
    ];
    const flow = makeFlow(nodes);
    const execution = makeExecution();

    const nodeExecutor = makeNodeExecutorMock(
      {
        ai: { riskScore: 0.25, confidence: 0.92, recommendation: 'APPROVE' },
        end: { finalDecision: 'APPROVE', riskScore: 0.25, confidence: 0.92, completedAt: '' },
      },
      { start: 'ai', ai: 'end' },
    );
    const engine = new GraphEngine(nodeExecutor as never);

    const result = await engine.execute(flow, execution, 'trace-1');
    expect(result.riskScore).toBe(0.25);
    expect(result.confidence).toBe(0.92);
  });
});

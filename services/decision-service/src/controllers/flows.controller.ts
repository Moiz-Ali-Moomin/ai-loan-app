import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { z, ZodError } from 'zod';
import { createLogger } from '@loan-platform/logger';
import { FlowService } from '../modules/flows/flow.service.js';
import { JwtAuthGuard, RolesGuard, CurrentUser, Roles } from '../auth/jwt.guard.js';
import { UserRole, DecisionNodeType, type AuthenticatedUser } from '../common/types.js';
import { FlowNotFoundError, ValidationError } from '../common/errors.js';

const logger = createLogger('decision-service:flows-controller');

// ─── Schemas ──────────────────────────────────────────────────────────────────

const NodeInputSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(DecisionNodeType),
  config: z.record(z.unknown()).default({}),
  nextNodeId: z.string().optional(),
  fallbackNodeId: z.string().optional(),
  branches: z.array(z.object({
    condition: z.string(),
    nodeId: z.string(),
    label: z.string().optional(),
  })).default([]),
  timeoutMs: z.number().int().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(10).default(3),
  retryDelayMs: z.number().int().positive().default(1000),
  positionX: z.number().int().default(0),
  positionY: z.number().int().default(0),
});

const CreateFlowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  version: z.string().default('1.0.0'),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
  nodes: z.array(NodeInputSchema).min(2),
});

// ─── Controller ────────────────────────────────────────────────────────────────

@Controller('api/v1/flows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FlowsController {
  constructor(private readonly flowService: FlowService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.UNDERWRITER)
  async createFlow(
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const input = CreateFlowSchema.parse(body);
      const flow = await this.flowService.createFlow({
        ...input,
        tenantId: user.tenantId,
        createdBy: user.sub,
      });
      return { success: true, data: this.serializeFlow(flow) };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.UNDERWRITER)
  async publishFlow(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const result = await this.flowService.publishFlow(id, user.tenantId, user.sub);
      return { success: true, data: result };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Post(':id/deprecate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async deprecateFlow(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      await this.flowService.deprecateFlow(id, user.tenantId, user.sub);
      return { success: true };
    } catch (err) {
      return this.handleError(err);
    }
  }

  @Get()
  async listFlows(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
  ) {
    const flows = await this.flowService.listFlows(user.tenantId, status as never);
    return { success: true, data: flows.map(f => this.serializeFlow(f)), total: flows.length };
  }

  @Get(':id')
  async getFlow(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const flow = await this.flowService.getFlow(id, user.tenantId);
      return { success: true, data: this.serializeFlow(flow) };
    } catch (err) {
      return this.handleError(err);
    }
  }

  private serializeFlow(flow: import('../domain/decision-flow.entity.js').DecisionFlow) {
    return {
      id: flow.id,
      tenantId: flow.tenantId,
      name: flow.name,
      description: flow.description,
      version: flow.version,
      status: flow.status,
      createdBy: flow.createdBy,
      updatedBy: flow.updatedBy,
      metadata: flow.metadata,
      tags: flow.tags,
      publishedAt: flow.publishedAt?.toISOString(),
      deprecatedAt: flow.deprecatedAt?.toISOString(),
      createdAt: flow.createdAt.toISOString(),
      updatedAt: flow.updatedAt.toISOString(),
      nodeCount: flow.nodes.length,
      nodes: flow.nodes.map(n => ({
        id: n.id,
        name: n.name,
        type: n.type,
        config: n.config,
        nextNodeId: n.nextNodeId,
        fallbackNodeId: n.fallbackNodeId,
        branches: n.branches,
        timeoutMs: n.timeoutMs,
        retryAttempts: n.retryAttempts,
        retryDelayMs: n.retryDelayMs,
        positionX: n.positionX,
        positionY: n.positionY,
      })),
    };
  }

  private handleError(err: unknown): never {
    if (err instanceof ZodError) {
      throw new BadRequestException({ error: 'Validation failed', details: err.issues });
    }
    if (err instanceof FlowNotFoundError) throw new NotFoundException(err.message);
    if (err instanceof ValidationError) throw new BadRequestException(err.message);
    logger.error('Flow controller error', { err });
    throw err;
  }
}

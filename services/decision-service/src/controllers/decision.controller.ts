import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';
import { createLogger } from '@loan-platform/logger';
import {
  UnderwritingDecisionRequestSchema,
  KYCDecisionRequestSchema,
  AMLDecisionRequestSchema,
  ReviewDecisionRequestSchema,
} from '../schemas/decision.schema.js';
import { DecisionPipeline } from '../services/decision-pipeline.js';
import { DecisionRepository } from '../repositories/decision.repository.js';
import {
  decisionLatencyHistogram,
  decisionOutcomeCounter,
  escalationCounter,
  confidenceHistogram,
  riskScoreHistogram,
} from '../utils/metrics.js';

const logger = createLogger('decision-service:controller');

@Controller('api/v1/decisions')
export class DecisionController {
  constructor(
    private readonly pipeline: DecisionPipeline,
    private readonly repository: DecisionRepository,
  ) {}

  @Post('underwriting')
  @HttpCode(HttpStatus.OK)
  async underwriting(
    @Body() body: unknown,
    @Headers('x-trace-id') traceId: string
  ) {
    const tid = traceId ?? randomUUID();
    try {
      const request = UnderwritingDecisionRequestSchema.parse(body);
      const result = await this.pipeline.executeUnderwriting(request, tid);
      this.recordMetrics(result.decision, result.confidence, result.risk_score, result.processing_latency_ms, result.escalation_reasons ?? []);
      logger.info('Underwriting decision completed', { applicationId: request.application_id, decision: result.decision, confidence: result.confidence, traceId: tid });
      return { success: true, data: result };
    } catch (err) {
      return this.handleError(err, tid, 'underwriting');
    }
  }

  @Post('kyc')
  @HttpCode(HttpStatus.OK)
  async kyc(
    @Body() body: unknown,
    @Headers('x-trace-id') traceId: string
  ) {
    const tid = traceId ?? randomUUID();
    try {
      const request = KYCDecisionRequestSchema.parse(body);
      const result = await this.pipeline.executeKYC(request, tid);
      this.recordMetrics(result.decision, result.confidence, result.risk_score, result.processing_latency_ms, result.escalation_reasons ?? []);
      return { success: true, data: result };
    } catch (err) {
      return this.handleError(err, tid, 'kyc');
    }
  }

  @Post('aml')
  @HttpCode(HttpStatus.OK)
  async aml(
    @Body() body: unknown,
    @Headers('x-trace-id') traceId: string
  ) {
    const tid = traceId ?? randomUUID();
    try {
      const request = AMLDecisionRequestSchema.parse(body);
      const result = await this.pipeline.executeAML(request, tid);
      this.recordMetrics(result.decision, result.confidence, result.risk_score, result.processing_latency_ms, result.escalation_reasons ?? []);
      return { success: true, data: result };
    } catch (err) {
      return this.handleError(err, tid, 'aml');
    }
  }

  @Post('review')
  @HttpCode(HttpStatus.OK)
  async review(
    @Body() body: unknown,
    @Headers('x-trace-id') traceId: string
  ) {
    const tid = traceId ?? randomUUID();
    try {
      const request = ReviewDecisionRequestSchema.parse(body);
      const result = await this.pipeline.executeReview(request, tid);
      this.recordMetrics(result.decision, result.confidence, result.risk_score, result.processing_latency_ms, result.escalation_reasons ?? []);
      return { success: true, data: result };
    } catch (err) {
      return this.handleError(err, tid, 'review');
    }
  }

  @Get('metrics')
  async metrics(@Query('tenant_id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenant_id query parameter required');
    const data = await this.repository.getMetrics(tenantId);
    return { success: true, data };
  }

  @Get()
  async list(
    @Query('tenant_id') tenantId: string,
    @Query('application_id') applicationId?: string,
    @Query('limit') limit?: number
  ) {
    if (!tenantId) throw new BadRequestException('tenant_id query parameter required');
    const records = applicationId
      ? await this.repository.findByApplicationId(applicationId, tenantId)
      : await this.repository.findRecent(tenantId, Math.min(limit ?? 50, 200));
    return { success: true, data: records, total: records.length };
  }

  @Get(':id/explanation')
  async explanation(
    @Param('id') id: string,
    @Query('tenant_id') tenantId: string
  ) {
    if (!tenantId) throw new BadRequestException('tenant_id query parameter required');
    const data = await this.repository.findExplanation(id, tenantId);
    if (!data) throw new NotFoundException('Decision not found');
    return { success: true, data };
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('tenant_id') tenantId: string
  ) {
    if (!tenantId) throw new BadRequestException('tenant_id query parameter required');
    const record = await this.repository.findById(id, tenantId);
    if (!record) throw new NotFoundException('Decision not found');
    return { success: true, data: record };
  }

  private recordMetrics(decision: string, confidence: number, riskScore: number, latencyMs: number, escalationReasons: string[]): void {
    decisionLatencyHistogram.record(latencyMs, { decision });
    decisionOutcomeCounter.add(1, { decision });
    confidenceHistogram.record(confidence, { decision });
    riskScoreHistogram.record(riskScore, { decision });
    for (const reason of escalationReasons) escalationCounter.add(1, { reason });
  }

  private handleError(err: unknown, traceId: string, endpoint: string): never {
    if (err instanceof ZodError) {
      logger.warn('Validation error', { endpoint, issues: err.issues, traceId });
      throw new BadRequestException({ error: 'Validation failed', details: err.issues });
    }
    logger.error('Decision pipeline error', { err, endpoint, traceId });
    throw new InternalServerErrorException({ error: 'Internal decision service error', traceId });
  }
}

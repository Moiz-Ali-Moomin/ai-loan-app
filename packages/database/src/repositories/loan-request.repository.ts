import { prisma, Prisma } from '../prisma.js';
import type { LoanRequest } from '../prisma.js';

export class LoanRequestRepository {
  async findById(id: string): Promise<LoanRequest | null> {
    return prisma.loanRequest.findUnique({
      where: { id },
    });
  }

  async findByTenantId(tenantId: string, pagination: { skip?: number; take?: number } = {}): Promise<LoanRequest[]> {
    const query: any = {
      where: { tenantId },
      orderBy: { submittedAt: 'desc' },
    };
    if (pagination.skip !== undefined) query.skip = pagination.skip;
    if (pagination.take !== undefined) query.take = pagination.take;
    
    return prisma.loanRequest.findMany(query);
  }

  async create(data: Prisma.LoanRequestUncheckedCreateInput): Promise<LoanRequest> {
    return prisma.loanRequest.create({
      data,
    });
  }

  async updateStatus(id: string, status: string): Promise<LoanRequest> {
    return prisma.loanRequest.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }
}

export const loanRequestRepository = new LoanRequestRepository();

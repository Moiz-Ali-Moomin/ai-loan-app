import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  createParamDecorator,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { createLogger } from '@loan-platform/logger';
import { UserRole, type AuthenticatedUser } from '../common/types.js';

const logger = createLogger('decision-service:auth');

// ─── Metadata keys ────────────────────────────────────────────────────────────

export const ROLES_KEY = 'roles';
export const PUBLIC_KEY = 'isPublic';

// ─── Decorators ────────────────────────────────────────────────────────────────

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const Public = () => SetMetadata(PUBLIC_KEY, true);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  }
);

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    return request.user?.tenantId;
  }
);

// ─── JWT Guard ────────────────────────────────────────────────────────────────

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly secret: string;

  constructor(private readonly reflector: Reflector) {
    const secret = process.env['JWT_SECRET'];
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be set and at least 32 characters');
    }
    this.secret = secret;
  }

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest<{
      headers: Record<string, string>;
      user?: AuthenticatedUser;
    }>();

    const token = this.extractToken(request.headers);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    try {
      const payload = jwt.verify(token, this.secret) as AuthenticatedUser;
      this.validatePayload(payload);
      request.user = payload;
      return true;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) throw new UnauthorizedException('Token expired');
      if (err instanceof jwt.JsonWebTokenError) throw new UnauthorizedException('Invalid token');
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractToken(headers: Record<string, string>): string | undefined {
    const auth = headers['authorization'];
    if (!auth?.startsWith('Bearer ')) return undefined;
    return auth.slice(7);
  }

  private validatePayload(payload: AuthenticatedUser): void {
    if (!payload.sub || !payload.tenantId || !payload.role) {
      throw new UnauthorizedException('Token missing required claims');
    }
  }
}

// ─── RBAC Guard ────────────────────────────────────────────────────────────────

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) throw new UnauthorizedException('Not authenticated');

    const hasRole = requiredRoles.includes(user.role as UserRole);
    if (!hasRole) {
      logger.warn('RBAC violation', { userId: user.sub, userRole: user.role, requiredRoles });
      throw new ForbiddenException(`Requires role: ${requiredRoles.join(' or ')}`);
    }
    return true;
  }
}

// ─── Tenant isolation helper ───────────────────────────────────────────────────

export function assertTenantAccess(user: AuthenticatedUser, resourceTenantId: string): void {
  if (user.tenantId !== resourceTenantId && user.role !== UserRole.ADMIN) {
    logger.warn('Tenant isolation violation', {
      userId: user.sub, userTenant: user.tenantId, resourceTenant: resourceTenantId,
    });
    throw new ForbiddenException('Access denied to resource of another tenant');
  }
}

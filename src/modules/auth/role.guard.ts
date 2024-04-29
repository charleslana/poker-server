import { Request } from 'express';
import { Role, RoleEnum } from '@prisma/client';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(roles: RoleEnum[]) {
    this.roles = roles;
  }

  private roles: RoleEnum[];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const userRoles = request.user.roles.filter((role: Role) => {
      return this.roles.includes(role.name);
    });
    try {
      if (this.roles.length > 0 && userRoles.length === 0) {
        const logger = new Logger(RoleGuard.name);
        logger.error('Forbidden resource');
        throw new ForbiddenException();
      }
    } catch {
      throw new ForbiddenException();
    }
    return true;
  }
}

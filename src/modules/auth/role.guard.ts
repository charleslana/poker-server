import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Role, RoleEnum } from '@prisma/client';

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
        return false;
      }
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}

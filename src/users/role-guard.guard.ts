import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';

@Injectable()
export class RolesGuardsAdmin implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireRoles = this.reflector.getAllAndOverride<Role[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('Required role', requireRoles);

    if (!requireRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    console.log('Context', user);

    if (!user || !user.role) {
      return false;
    }

    if (requireRoles && user.role.includes('admin')) {
      console.log('User has admin role');
      return true;
    }

    console.log('User roles', user.role);

  }
}
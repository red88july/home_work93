import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuardsUser implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requireRoleUser = this.reflector.getAllAndOverride<Role[]>('role', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requireRoleUser) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            return false;
        }

        if (requireRoleUser && user.role.includes('user')) {
            return true;
        }
    }
}
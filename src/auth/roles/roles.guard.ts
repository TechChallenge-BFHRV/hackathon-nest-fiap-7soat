import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {} // Inject Prisma

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) return true; // No roles required

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { email: user.email },
      select: { role: true },
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found.');
    }

    // If user is an ADMIN, allow access
    if (dbUser.role === 'ADMIN') {
      return true;
    }

    // Allow users to access their own data
    if (user.email === request.params?.email) {
      return true;
    }

    // Otherwise, deny access
    throw new ForbiddenException('You are not allowed to access this resource.');
  }
}
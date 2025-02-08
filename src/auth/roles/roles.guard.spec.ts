import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { PrismaService } from "../../prisma/prisma.service";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let prisma: PrismaService;

  beforeEach(() => {
    reflector = { get: jest.fn() } as any;
    prisma = { user: { findUnique: jest.fn() } } as any;
    guard = new RolesGuard(reflector, prisma);
  });

  const mockContext = (user: any, params?: any) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user, params }),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  };

  it("should allow access if no roles are required", async () => {
    (reflector.get as jest.Mock).mockReturnValue(undefined);
    const context = mockContext({ email: "user@example.com" });
    expect(await guard.canActivate(context)).toBe(true);
  });

  it("should throw ForbiddenException if user is not found in the database", async () => {
    (reflector.get as jest.Mock).mockReturnValue(["USER"]);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const context = mockContext({ email: "notfound@example.com" });
    await expect(guard.canActivate(context)).rejects.toThrow("User not found.");
  });

  it("should allow access if user is an ADMIN", async () => {
    (reflector.get as jest.Mock).mockReturnValue(["USER"]);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: "ADMIN" });
    const context = mockContext({ email: "admin@example.com" });
    expect(await guard.canActivate(context)).toBe(true);
  });

  it("should allow access if user is accessing their own data", async () => {
    (reflector.get as jest.Mock).mockReturnValue(["USER"]);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: "USER" });
    const context = mockContext(
      { email: "user@example.com" },
      { email: "user@example.com" }
    );
    expect(await guard.canActivate(context)).toBe(true);
  });

  it("should throw ForbiddenException if user does not have the required role and is not accessing their own data", async () => {
    (reflector.get as jest.Mock).mockReturnValue(["USER"]);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: "USER" });
    const context = mockContext(
      { email: "user@example.com" },
      { email: "other@example.com" }
    );
    await expect(guard.canActivate(context)).rejects.toThrow("You are not allowed to access this resource.");
  });
});
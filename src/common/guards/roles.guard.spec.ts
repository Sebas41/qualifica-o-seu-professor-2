import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;
  let context: ExecutionContext;
  let request: { user?: { role?: UserRole } };

  beforeEach(() => {
    request = {};
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    guard = new RolesGuard(reflector);
    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  });

  it('should allow access when no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when user has role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([UserRole.ADMIN]);
    request.user = { role: UserRole.ADMIN };

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny when user lacks role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValueOnce(false);
    (reflector.getAllAndOverride as jest.Mock).mockReturnValueOnce([UserRole.ADMIN]);
    request.user = { role: UserRole.STUDENT };

    expect(guard.canActivate(context)).toBe(false);
  });
});
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let reflector: Reflector;
  let guard: JwtAuthGuard;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    guard = new JwtAuthGuard(reflector);
    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow public endpoints', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should delegate to parent guard when endpoint is protected', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const parentCanActivate = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true as any);

    const result = guard.canActivate(context);

    expect(parentCanActivate).toHaveBeenCalledWith(context);
    expect(result).toBe(true);
  });
});

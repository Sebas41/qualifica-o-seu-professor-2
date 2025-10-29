import { ExecutionContext } from '@nestjs/common';
import { OptionalAuthGuard } from './optional-auth.guard';

describe('OptionalAuthGuard', () => {
  let guard: OptionalAuthGuard;
  let context: ExecutionContext;

  beforeEach(() => {
    guard = new OptionalAuthGuard();
    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return true when authentication succeeds', async () => {
    const parentCanActivate = jest
      .spyOn(Object.getPrototypeOf(OptionalAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    const result = await guard.canActivate(context);

    expect(parentCanActivate).toHaveBeenCalledWith(context);
    expect(result).toBe(true);
  });

  it('should return true when authentication fails', async () => {
    const parentCanActivate = jest
      .spyOn(Object.getPrototypeOf(OptionalAuthGuard.prototype), 'canActivate')
      .mockReturnValue(Promise.reject(new Error('Unauthorized')));

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return user when authentication succeeds', () => {
    const user = { id: '1', email: 'test@example.com' };

    const result = guard.handleRequest(null, user);

    expect(result).toEqual(user);
  });

  it('should return undefined when no user provided', () => {
    const result = guard.handleRequest(null, null);

    expect(result).toBeUndefined();
  });

  it('should return undefined when user is undefined', () => {
    const result = guard.handleRequest(null, undefined);

    expect(result).toBeUndefined();
  });

  it('should return undefined when authentication fails with error', () => {
    const error = new Error('Authentication failed');

    const result = guard.handleRequest(error, null);

    expect(result).toBeUndefined();
  });
});

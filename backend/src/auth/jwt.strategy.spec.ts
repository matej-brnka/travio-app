import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

const mockConfig = { getOrThrow: () => 'test-secret' } as unknown as ConfigService;

describe('JwtStrategy.validate', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy(mockConfig);
  });

  it('returns user object for valid payload', async () => {
    const result = await strategy.validate({ sub: 'user-123', email: 'a@b.com' });
    expect(result).toEqual({ userId: 'user-123', email: 'a@b.com' });
  });

  it('throws UnauthorizedException when sub is missing', async () => {
    await expect(strategy.validate({ email: 'a@b.com' })).rejects.toThrow(UnauthorizedException);
  });
});

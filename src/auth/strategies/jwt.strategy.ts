import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { BlacklistedToken } from '../entities/blacklisted-token.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'defaultSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    // Check if token is blacklisted
    if (payload.jti) {
      const blacklistedToken = await this.blacklistedTokenRepository.findOne({
        where: { jti: payload.jti },
      });

      if (blacklistedToken) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as JwtStrategyBase, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

function fromBearerOrQuery(req: Request): string | null {
  const fromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (fromHeader) return fromHeader;
  if (req && typeof req.query?.access_token === 'string' && req.query.access_token) {
    return req.query.access_token;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: fromBearerOrQuery,
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: { sub: string; email: string; role: string; name: string }) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  }
}
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Custom extractor untuk handle "Bearer Bearer" issue dari Swagger UI
const extractJwtFromRequest = (req: Request) => {
  let token: string | null = null;

  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;

    // Handle "Bearer Bearer token" atau "Bearer token"
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      // Jika masih ada "Bearer" di depan, buang
      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }
    } else {
      token = authHeader;
    }
  }

  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: Number(payload.sub),
      role: payload.role,
      email: payload.email,
    };
  }
}

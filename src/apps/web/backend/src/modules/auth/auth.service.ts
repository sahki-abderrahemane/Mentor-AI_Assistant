import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotImplementedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from '../users/entities/user.entity.js';
import { UserRole, ROLE_PERMISSIONS } from '../../common/constants.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepo: Repository<RefreshToken>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(email: string, password: string, name: string) {
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.usersRepo.create({
      email,
      name,
      passwordHash,
      role: UserRole.MEMBER,
      emailVerified: false,
    });
    await this.usersRepo.save(user);

    const tokens = await this.issueTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string, userAgent?: string, ip?: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user, userAgent, ip);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const tokenHash = await this.hashToken(refreshToken);
    const stored = await this.refreshTokensRepo.findOne({
      where: { tokenHash, revoked: false },
      relations: ['user'],
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = stored.user;
    await this.refreshTokensRepo.update(stored.id, { revoked: true });
    const tokens = await this.issueTokens(user);
    return tokens;
  }

  async logout(refreshToken: string) {
    const tokenHash = await this.hashToken(refreshToken);
    await this.refreshTokensRepo.update({ tokenHash }, { revoked: true });
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return; // always succeed to prevent email enumeration
    // TODO: send reset email with token
  }

  async resetPassword(token: string, newPassword: string) {
    // TODO: verify token, reset password
    throw new NotImplementedException('Password reset is not yet implemented');
  }

  async verifyEmail(token: string) {
    // TODO: verify token, set emailVerified = true
    throw new NotImplementedException('Email verification is not yet implemented');
  }

  private async issueTokens(user: User, userAgent?: string, ip?: string) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
      expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d'),
    });

    const tokenHash = await this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const rt = this.refreshTokensRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      ip,
    });
    await this.refreshTokensRepo.save(rt);

    // Set HttpOnly cookies
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: this.config.get('NODE_ENV') === 'production',
    };

    return {
      accessToken,
      refreshToken,
      accessTokenCookieOptions: { ...cookieOptions, path: '/' },
      refreshTokenCookieOptions: { ...cookieOptions, path: '/auth/refresh' },
    };
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
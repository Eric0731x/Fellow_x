import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { RefreshDto } from './dto/refresh.dto';
import type { SmsCodeDto } from './dto/sms-code.dto';

interface SmsRecord {
  code: string;
  expiresAt: number;
  scene: string;
}

@Injectable()
export class AuthService {
  private smsCodes = new Map<string, SmsRecord>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async sendSmsCode(dto: SmsCodeDto): Promise<void> {
    const code = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000;
    this.smsCodes.set(dto.phone, { code, expiresAt, scene: dto.scene });
  }

  async register(dto: RegisterDto) {
    if (!this.validateSmsCode(dto.phone, dto.smsCode, 'register')) {
      throw new BadRequestException({ code: 'SMS_INVALID', message: '验证码无效或已过期' });
    }

    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({ code: 'PHONE_EXISTS', message: '该手机号已注册' });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const memberNo = await this.generateMemberNo();

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        name: dto.name,
        memberNo,
        levelId: 1,
        status: 'ACTIVE',
        role: 'MEMBER',
        lastLoginAt: new Date(),
      },
      select: {
        id: true, memberNo: true, name: true, phone: true,
        avatarUrl: true, gender: true, birthday: true, email: true,
        role: true, status: true, levelId: true,
        growthPoints: true, exchangePoints: true,
        participationDays: true, streakDays: true,
        profileCompleted: true, profilePromptSkipped: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (!user) {
      throw new UnauthorizedException({ code: 'CREDENTIAL_INVALID', message: '手机号或密码错误' });
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException({ code: 'USER_SUSPENDED', message: '账号已被封禁' });
    }

    if (dto.smsCode) {
      if (!this.validateSmsCode(dto.phone, dto.smsCode, 'login')) {
        throw new BadRequestException({ code: 'SMS_INVALID', message: '验证码无效或已过期' });
      }
    } else if (dto.password) {
      const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!passwordValid) {
        throw new UnauthorizedException({ code: 'CREDENTIAL_INVALID', message: '手机号或密码错误' });
      }
    } else {
      throw new BadRequestException({ code: 'VALIDATION', message: '请提供密码或验证码' });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash, deletedAt, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  async refresh(dto: RefreshDto) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: { select: { id: true, role: true, status: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedException({ code: 'TOKEN_INVALID', message: '刷新令牌无效' });
    }

    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedException({ code: 'TOKEN_INVALID', message: '刷新令牌已过期' });
    }

    if (storedToken.user.status === 'SUSPENDED') {
      throw new ForbiddenException({ code: 'USER_SUSPENDED', message: '账号已被封禁' });
    }

    const accessToken = this.jwtService.sign(
      { sub: storedToken.userId, role: storedToken.user.role },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      },
    );

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private validateSmsCode(phone: string, code: string, scene: string): boolean {
    const record = this.smsCodes.get(phone);
    if (!record) return false;
    if (record.expiresAt < Date.now()) {
      this.smsCodes.delete(phone);
      return false;
    }
    if (record.scene !== scene) return false;
    if (record.code !== code) return false;
    this.smsCodes.delete(phone);
    return true;
  }

  private async generateMemberNo(): Promise<string> {
    const result = await this.prisma.$transaction(async (tx) => {
      const latest = await tx.user.findFirst({
        where: { memberNo: { startsWith: 'FX-' } },
        orderBy: { memberNo: 'desc' },
        select: { memberNo: true },
      });
      const nextNum = latest
        ? parseInt(latest.memberNo.replace('FX-', ''), 10) + 1
        : 1;
      return `FX-${String(nextNum).padStart(6, '0')}`;
    });
    return result;
  }

  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }
}

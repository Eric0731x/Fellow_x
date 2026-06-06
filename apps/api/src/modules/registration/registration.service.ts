import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';
import type { ReviewDto } from './dto/review.dto';
import type { RegistrationQueryDto } from './dto/registration-query.dto';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  async register(_userId: string, _activityId: string, _dto: RegisterDto) { throw new Error('Not implemented'); }
  async findMine(_userId: string, _query: RegistrationQueryDto) { throw new Error('Not implemented'); }
  async cancel(_userId: string, _id: string) { throw new Error('Not implemented'); }
  async findByActivity(_activityId: string, _query: RegistrationQueryDto) { throw new Error('Not implemented'); }
  async review(_id: string, _dto: ReviewDto) { throw new Error('Not implemented'); }
}

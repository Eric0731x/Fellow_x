import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { ApplyDto } from './dto/apply.dto';

@Injectable()
export class LauncherService {
  constructor(private prisma: PrismaService) {}

  async apply(_userId: string, _dto: ApplyDto) { throw new Error('Not implemented'); }
  async findMyApplication(_userId: string) { throw new Error('Not implemented'); }
}

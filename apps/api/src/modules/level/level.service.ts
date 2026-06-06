import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.level.findMany({ orderBy: { id: 'asc' } });
  }
}

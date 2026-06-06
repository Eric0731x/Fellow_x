import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(_userId: string) { throw new Error('Not implemented'); }
  async markAsRead(_id: string) { throw new Error('Not implemented'); }
  async markAllAsRead(_userId: string) { throw new Error('Not implemented'); }
}

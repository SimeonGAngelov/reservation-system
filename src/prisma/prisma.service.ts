import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly config: ConfigService) {
    const connectionString = config.get('DATABASE_URL');

    if (!connectionString) {
        throw new Error('DATABASE_URL is not defined in .env');
    }

    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }
}

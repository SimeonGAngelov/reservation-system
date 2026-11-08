import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkerDto, UpdateWorkerDto, WorkerResponseDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkerService {
    constructor(private readonly prisma: PrismaService) {}    

    async createWorker(userId: string, dto: CreateWorkerDto): Promise<WorkerResponseDto> {
        try {
            return await this.prisma.worker.create({
                data: {
                    ...dto,
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                },
                select: {
                    id: true,
                    displayName: true,
                    bio: true
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Worker profile already exists!');
            }

            throw error;
        }
    }

    async getWorker(userId: string): Promise<WorkerResponseDto> {
        const worker = await this.prisma.worker.findUnique({
            where: {
                userId
            },
            select: {
                id: true,
                displayName: true,
                bio: true
            }
        });

        if (!worker) {
            throw new NotFoundException('Worker profile not found!');
        }

        return worker;
    }

    async updateWorker(userId: string, dto: UpdateWorkerDto): Promise<WorkerResponseDto> {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('At least one field is required to update a worker!');
        }

        try {
            return await this.prisma.worker.update({
                where: {
                    userId
                },
                data: {
                    ...dto
                },
                select: {
                    id: true,
                    displayName: true,
                    bio: true
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException('Worker profile not found!');
            }

            throw error;
        }
    }
}

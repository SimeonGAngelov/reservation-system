import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto, ServiceResponseDto, UpdateServiceDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
    constructor(private readonly prisma: PrismaService) {}

    async createService(dto: CreateServiceDto): Promise<ServiceResponseDto> {
        return await this.prisma.service.create({
            data: {
                ...dto
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true
            }
        });
    }

    async getAllServices(): Promise<ServiceResponseDto[]> {
        return await this.prisma.service.findMany(
            {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    duration: true
                }
            }
        );
    }

    async getServiceById(serviceId: string): Promise<ServiceResponseDto> {
        const service = await this.prisma.service.findUnique({
            where: {
                id: serviceId
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true
            }
        });

        if (!service) {
            throw new NotFoundException('Service not found!');
        }

        return service;
    }

    async updateService(serviceId: string, dto: UpdateServiceDto): Promise<ServiceResponseDto> {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('At least one field is required to update a service!');
        }

        try {
            return await this.prisma.service.update({
                where: {
                    id: serviceId
                },
                data: {
                    ...dto
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    duration: true
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException('Service not found!');
            }

            throw error;
        }
    }

    async deleteService(serviceId: string): Promise<void> {
        try {
            await this.prisma.service.delete({
                where: {
                    id: serviceId
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException('Service not found!');
            }

            throw error;
        }
    }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard, RolesGuard } from '../common/guards';
import { GetCurrentUserId, Roles } from '../common/decorators';
import { CreateWorkerDto, UpdateWorkerDto, WorkerResponseDto } from './dto';
import { WorkerService } from './worker.service';
import { Role } from '@prisma/client';

@Controller('worker')
export class WorkerController {
    constructor(private readonly workerService: WorkerService) {}

    @Post()
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles(Role.WORKER)
    @HttpCode(HttpStatus.CREATED)
    async createWorker(
        @GetCurrentUserId() userId: string,
        @Body() dto: CreateWorkerDto
    ): Promise<WorkerResponseDto> {
        return await this.workerService.createWorker(userId, dto);
    }

    @Get('me')
    @UseGuards(AccessTokenGuard, RolesGuard)
    @HttpCode(HttpStatus.OK)
    async getWorker(
        @GetCurrentUserId() userId: string
    ): Promise<WorkerResponseDto> {
        return await this.workerService.getWorker(userId);
    }

    @Patch('me')
    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles(Role.WORKER)
    @HttpCode(HttpStatus.OK)
    async updateWorker(
        @GetCurrentUserId() userId: string,
        @Body() dto: UpdateWorkerDto
    ): Promise<WorkerResponseDto> {
        return await this.workerService.updateWorker(userId, dto);
    }
}

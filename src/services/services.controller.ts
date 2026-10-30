import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { AccessTokenGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '@prisma/client';
import { CreateServiceDto, ServiceResponseDto, UpdateServiceDto } from './dto';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createService(@Body() dto: CreateServiceDto): Promise<ServiceResponseDto> {
        return await this.servicesService.createService(dto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllServices(): Promise<ServiceResponseDto[]> {
        return await this.servicesService.getAllServices();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getServiceById(
        @Param('id', ParseUUIDPipe) serviceId: string
    ): Promise<ServiceResponseDto> {
        return await this.servicesService.getServiceById(serviceId);
    }

    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async updateService(
        @Param('id', ParseUUIDPipe) serviceId: string,
        @Body() dto: UpdateServiceDto
    ): Promise<ServiceResponseDto> {
        return await this.servicesService.updateService(serviceId, dto);
    }

    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteService(@Param('id', ParseUUIDPipe) serviceId: string): Promise<void> {
        return await this.servicesService.deleteService(serviceId);
    }
}

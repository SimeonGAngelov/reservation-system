import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Role } from '@prisma/client';

export class SignUpDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsString()
    @IsNotEmpty()
    @Length(6, 20)
    password: string;
}
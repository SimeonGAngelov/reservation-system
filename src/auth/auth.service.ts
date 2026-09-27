import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, Tokens } from './types';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService
    ) {}

    async signUp(dto: SignUpDto): Promise<Tokens> {
        const hash = await argon.hash(dto.password);

        try {
            const user = await this.prisma.user.create({
                data: {
                    ...dto,
                    role: dto.role as Role,
                    password: hash
                }
            });

            const tokens = await this.generateTokens({id: user.id, email: user.email});
            await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
            
            return tokens;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }

            throw error;
        }
    }

    async signIn(dto: SignInDto): Promise<Tokens> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new ForbiddenException('Invalid credentials!');
        }

        const passwordMatches = await argon.verify(user.password, dto.password);
        if (!passwordMatches) {
            throw new ForbiddenException('Invalid credentials!');
        }

        const tokens = await this.generateTokens({id: user.id, email: user.email});
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return tokens;
    }

    async signOut(userId: string) {
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: null
            }
        });
    }

    async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new ForbiddenException('No user found with this id!');
        }

        if (!user.refreshToken) {
            throw new ForbiddenException('Invalid refresh token!');
        }

        const refreshTokenMatches = await argon.verify(user.refreshToken, refreshToken);
        if (!refreshTokenMatches) {
            throw new ForbiddenException('Invalid refresh token!');
        }

        const tokens = await this.generateTokens({id: user.id, email: user.email});
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return tokens;
    }

    private async updateRefreshTokenHash(userId: string, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await argon.hash(refreshToken);
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: hashedRefreshToken
            }
        });
    }

    private async generateTokens(payload: JwtPayload): Promise<Tokens> {
        const [access_token, refresh_token] = await Promise.all([
            this.jwt.signAsync(
                payload, 
                {
                    expiresIn: this.config.get('ACCESS_TOKEN_EXPIRATION_TIME'),
                    secret: this.config.get('ACCESS_TOKEN_SECRET')
                }
            ),
            this.jwt.signAsync(
                payload, 
                {
                    expiresIn: this.config.get('REFRESH_TOKEN_EXPIRATION_TIME'),
                    secret: this.config.get('REFRESH_TOKEN_SECRET')
                }
            )
        ]);

        return { access_token, refresh_token };
    }
}

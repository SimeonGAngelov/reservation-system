import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { Prisma, Role } from '../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types';

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
                    role: dto.role as unknown as Role,
                    password: hash
                }
            });

            const tokens = await this.generateTokens(user.id, user.email);
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

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return tokens;
    }

    signOut() {}

    refreshTokens() {}

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

    private async generateTokens(userId: string, email: string): Promise<Tokens> {
        const payload = {
            sub: userId,
            email
        };
        
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

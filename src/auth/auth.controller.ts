import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { JwtRefresh, Tokens } from './types';
import { GetCurrentUser, GetCurrentUserId } from '../common/decorators';
import { AccessTokenGuard, RefreshTokenGuard } from '../common/guards';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}    

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() dto: SignUpDto): Promise<Tokens> {
        return await this.authService.signUp(dto);
    }
    
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() dto: SignInDto): Promise<Tokens> {
        return await this.authService.signIn(dto);
    }

    @UseGuards(AccessTokenGuard)
    @Post('signout')
    @HttpCode(HttpStatus.OK)
    async signOut(@GetCurrentUserId() userId: string)  {
        return await this.authService.signOut(userId);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(
        @GetCurrentUserId() userId: string,
        @GetCurrentUser('refreshToken') refreshToken: string
    ): Promise<Tokens> {
        return await this.authService.refreshTokens(userId, refreshToken);
    }
}

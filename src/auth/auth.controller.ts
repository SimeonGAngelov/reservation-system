import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}    

    @Post('signup')
    signUp(@Body() dto: SignUpDto): Promise<Tokens> {
        return this.authService.signUp(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() dto: SignInDto): Promise<Tokens> {
        return this.authService.signIn(dto);
    }

    @Post('signout')
    signOut() {
        return this.authService.signOut();
    }

    @Post('refresh')
    refreshTokens() {
        return this.authService.refreshTokens();
    }
}

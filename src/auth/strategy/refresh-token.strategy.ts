import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.getOrThrow('REFRESH_TOKEN_SECRET'),
            passReqToCallback: true
        });        
    } 

    validate(req: Request, payload: any): any {
        const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();
        return { ...payload, refreshToken };
    }
}
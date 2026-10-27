import { JwtPayload } from './jwt-payload.types';

export type JwtRefreshPayload = JwtPayload & {
    refreshToken: string;
};
export interface JwtInterface {
    CreateToken(payload: TokenInfoPayload, type: TokenType): string
    VerifyToken(token: string): Promise<TokenInfoResult>
    GetTokenResut(cookie: string): TokenInfoResult
    MapCookie(cookie: string): Record<string, string>
}

export type TokenType = "access_token" | "refresh_token";

export type TokenInfoPayload = {
    profile_id: number
    role_id: number
    email: string
    uuid: string
}

export type TokenInfoResult = TokenInfoPayload & {
    iat: number
    exp: number
}
export interface JwtInterface {
    CreateToken(payload: TokenInfoPayload, type: TokenType): string
    VerifyToken(token: string): Promise<TokenInfoResult | Error>
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
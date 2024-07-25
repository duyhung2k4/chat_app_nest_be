import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import { Injectable } from "@nestjs/common";
import { JwtInterface, TokenInfoPayload, TokenInfoResult, TokenType } from "./index.interface";

@Injectable()
export class JwtService implements JwtInterface {
    private privateKey: Buffer

    constructor() {
        this.privateKey = fs.readFileSync('src/keys/private.key');
    }

    CreateToken(payload: TokenInfoPayload, type: TokenType): string {
        const token: string = jwt.sign(payload, this.privateKey, {
            expiresIn: 24 * 60 * 60 * (type === "access_token" ? 1 : 3),
            algorithm: "RS256",
        });

        return token;
    }

    async VerifyToken(token: string): Promise<TokenInfoResult | Error> {
        try {
            const data = jwt.verify(token, this.privateKey) as Record<string, any>;
            return data as TokenInfoResult;
        } catch (error) {
            return error;
        }
    }
}
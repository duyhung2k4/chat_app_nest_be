import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import { Injectable } from "@nestjs/common";
import { JwtInterface, TokenInfoPayload, TokenInfoResult, TokenType } from "./index.interface";
import { TOKEN_TYPE } from "@/constants/token";

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

    MapCookie(cookie: string): Record<string, string> {
        let mapToken: Record<string, string> = {};
        const listTokenString = cookie.split("; ");
        listTokenString.forEach(item => {
            const arr = item.split("=");
            if(arr.length === 2) {
                mapToken[arr[0]] = arr[1];
            }
        })
        return mapToken;
    }

    async VerifyToken(token: string): Promise<TokenInfoResult> {
        try {
            const data = jwt.verify(token, this.privateKey) as Record<string, any>;
            return data as TokenInfoResult;
        } catch (error) {
            return error;
        }
    }

    GetTokenResut(bearerToken: string | undefined): TokenInfoResult {
        try {
            const token = bearerToken.split(" ")?.[1];
            if(!token) {
                throw new Error("token error");
            }

            const tokenInfoResult = jwt.verify(token, this.privateKey) as TokenInfoResult;
            
            return tokenInfoResult;
        } catch (error) {
            return error;
        }    
    }
}
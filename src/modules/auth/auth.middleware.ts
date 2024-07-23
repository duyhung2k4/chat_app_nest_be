import { HandleResponse } from "@/utils/http";
import JwtUtils from "@/utils/jwt";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private jwtUtils: JwtUtils
    private handleResponse: HandleResponse
    
    constructor() {
        this.jwtUtils = new JwtUtils();
        this.handleResponse = new HandleResponse();
    }
    
    async use(req: Request, res: Response, next: (error?: Error | any) => void) {
        try {
            const token = (req.headers.authorization || "").split(" ")?.[1];

            if(!token) {
                this.handleResponse.UnAuthorization(res, new Error("not token"));
                return;
            }
            
            const result = await this.jwtUtils.VerifyToken(token);

            if(result instanceof Error) {
                this.handleResponse.UnAuthorization(res, result);
                return;
            }

            next();
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
}
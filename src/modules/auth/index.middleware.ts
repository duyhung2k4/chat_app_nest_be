import { HttpService } from "@/shared/http/index.service";
import { JwtService } from "@/shared/jwt/index.service";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly httpService: HttpService,
    ) {

    }
    
    async use(req: Request, res: Response, next: (error?: Error | any) => void) {
        try {
            const token = (req.headers.authorization || "").split(" ")?.[1];

            if(!token) {
                this.httpService.UnAuthorization(res, new Error("not token"));
                return;
            }
            
            const result = await this.jwtService.VerifyToken(token);

            if(result instanceof Error) {
                this.httpService.UnAuthorization(res, result);
                return;
            }

            next();
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }
}
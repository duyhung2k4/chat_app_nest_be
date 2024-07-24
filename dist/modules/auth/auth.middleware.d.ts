import { NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
export declare class AuthMiddleware implements NestMiddleware {
    private jwtUtils;
    private handleResponse;
    constructor();
    use(req: Request, res: Response, next: (error?: Error | any) => void): Promise<void>;
}

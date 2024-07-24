import { NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
export declare class MorganMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: (error?: Error | any) => void): void;
}

import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as morgan from "morgan";

@Injectable()
export class MorganMiddleware implements NestMiddleware {
    
    use(req: Request, res: Response, next: (error?: Error | any) => void) {
        morgan("dev")(req, res, next);
    }
}
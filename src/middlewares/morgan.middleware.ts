import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as morgan from "morgan";
import * as fs from 'fs';
import * as path from 'path';

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

@Injectable()
export class MorganMiddleware implements NestMiddleware {
    
    use(req: Request, res: Response, next: (error?: Error | any) => void) {
        morgan("dev")(req, res, next);
    }
}
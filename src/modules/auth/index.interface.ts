import { Request, Response } from "express";

export interface AuthControllerInterface {
    Ping(req: Request, res: Response): void
    Register(req: Request, res: Response): void
    RefreshToken(req: Request, res: Response): void
    GetTimeCodePending(req: Request, res: Response): void
    AcceptCode(req: Request, res: Response): void
    Login(req: Request, res: Response): void
    SendRepeatCode(req: Request, res: Response): void
}
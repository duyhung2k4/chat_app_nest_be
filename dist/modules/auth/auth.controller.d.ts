import JwtUtils from "@/utils/jwt";
import { AuthService } from "@/modules/auth/auth.service";
import { Request, Response } from "express";
import { HandleResponse } from "@/utils/http";
export declare class AuthController {
    private readonly authService;
    private readonly jwtUtils;
    private readonly handleResponse;
    constructor(authService: AuthService, jwtUtils: JwtUtils, handleResponse: HandleResponse);
    Ping(req: Request, res: Response): Promise<void>;
    Register(req: Request, res: Response): Promise<void>;
    RefreshToken(req: Request, res: Response): Promise<void>;
    GetTimeCodePending(req: Request, res: Response): Promise<void>;
    AcceptCode(req: Request, res: Response): Promise<void>;
    Login(req: Request, res: Response): Promise<void>;
    SendRepeatCode(req: Request, res: Response): Promise<void>;
}

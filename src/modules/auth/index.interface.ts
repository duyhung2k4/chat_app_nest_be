import { ProfileModel } from "@/models/profile";
import { Request, Response } from "express";
import { GetInfoSetTokenResponse, TypeRedisCreatePendingUser } from "./index.service";
import { UserModel } from "@/models/user";
import { RegisterRequest } from "@/dto/request/auth";

export interface AuthControllerInterface {
    Ping(req: Request, res: Response): void
    Register(req: Request, res: Response): void
    RefreshToken(req: Request, res: Response): void
    GetTimeCodePending(req: Request, res: Response): void
    AcceptCode(req: Request, res: Response): void
    Login(req: Request, res: Response): void
    SendRepeatCode(req: Request, res: Response): void
}

export interface AuthServiceInterface {
    GetProfile(profileId: number): Promise<ProfileModel | Error>
    GetInfoSetToken(profileId: number): Promise<GetInfoSetTokenResponse | Error>
    CheckUser(email: string): Promise<UserModel | null | Error>
    CreatePendingUser(payload: RegisterRequest): Promise<any | Error>
    AcceptCode(email: string, code: string): Promise<string | Error>
    CreateProfile(email: string, passwordHash: string): Promise<ProfileModel | Error>
    CheckUserLogin(infoLogin: { email: string, password: string }): Promise<ProfileModel | Error>
    GetDataCodePending(email: string): Promise<TypeRedisCreatePendingUser | Error>
}
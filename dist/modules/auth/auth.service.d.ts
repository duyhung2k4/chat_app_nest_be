import * as dayjs from "dayjs";
import { RegisterRequest } from "@/dto/request/auth";
import { ProfileModel } from "@/models/profile";
import { UserModel } from "@/models/user";
export declare class AuthService {
    private readonly clientPg;
    private readonly clientRedis;
    private readonly clientEmail;
    private readonly authUtils;
    constructor();
    GetProfile(profileId: number): Promise<ProfileModel | Error>;
    GetInfoSetToken(profileId: number): Promise<GetInfoSetTokenResponse | Error>;
    CheckUser(email: string): Promise<UserModel | null | Error>;
    CreatePendingUser(payload: RegisterRequest): Promise<any | Error>;
    AcceptCode(email: string, code: string): Promise<string | Error>;
    CreateProfile(email: string, passwordHash: string): Promise<ProfileModel | Error>;
    CheckUserLogin(infoLogin: {
        email: string;
        password: string;
    }): Promise<ProfileModel | Error>;
    GetDataCodePending(email: string): Promise<TypeRedisCreatePendingUser | Error>;
    private getRole;
}
export type TypeRedisCreatePendingUser = {
    data: RegisterRequest;
    code: string;
    ex: dayjs.Dayjs;
};
export type GetInfoSetTokenResponse = {
    profile_id: number;
    role_id: number;
    email: string;
};

import * as dayjs from 'dayjs'
import JwtUtils from "@/utils/jwt";

import { AuthService } from "@/modules/auth/auth.service";
import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { RegisterRequest } from "@/dto/request/auth";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { HandleResponse } from "@/utils/http";


@Controller("account/api/v1")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtUtils: JwtUtils,
        private readonly handleResponse: HandleResponse
    ) {

    }

    @Get("public/auth/ping")
    async Ping(@Req() req: Request, @Res() res: Response) {
        this.handleResponse.SuccessResponse(res, {
            mess: "OK",
        })
    }

    @Post("public/auth/register")
    async Register(@Req() req: Request, @Res() res: Response) {
        try {
            const data: RegisterRequest = req.body;

            const resultCheckUser = await this.authService.CheckUser(data.email);
            if (resultCheckUser instanceof Error && resultCheckUser !== null) {
                throw new Error(`check user error: ${resultCheckUser}`);
            }
            if (resultCheckUser) {
                throw new Error("email exist");
            }

            const resultSetRedisUserPending = await this.authService.CreatePendingUser(data);

            this.handleResponse.SuccessResponse(res, resultSetRedisUserPending);
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Post("protected/auth/refresh-token")
    async RefreshToken(@Req() req: Request, @Res() res: Response) {
        try {
            const token = req.headers?.authorization.split(" ")?.[1];

            if(!token) {
                throw new Error(`not token`);
            }

            const result = await this.jwtUtils.VerifyToken(token);

            if(result instanceof Error) {
                throw new Error(`error token: ${result}`);
            }

            const infoSetToken = await this.authService.GetInfoSetToken(result.profile_id);
            if(infoSetToken instanceof Error) {
                throw new Error(`info error: ${infoSetToken}`);
            }

            const accessToken = this.jwtUtils.CreateToken({
                ...infoSetToken,
                uuid: uuidv4().toString(),
            }, "access_token");

            const refreshToken = this.jwtUtils.CreateToken({
                ...infoSetToken,
                uuid: uuidv4().toString(),
            }, "refresh_token");

            const profile = await this.authService.GetProfile(infoSetToken.profile_id);
            if(profile instanceof Error) {
                throw new Error("profile not found");
            }

            this.handleResponse.SuccessResponse(res, {
                accessToken,
                refreshToken,
                profile,
            });
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Get("public/auth/time-code-pending")
    async GetTimeCodePending(@Req() req: Request, @Res() res: Response) {
        try {
            const { email }: { email: string } = req.query as { email: string };
            const data = await this.authService.GetDataCodePending(email);
            if (data instanceof Error) {
                throw new Error(`get time code error: ${data}`);
            }

            this.handleResponse.SuccessResponse(res, { dataTime: dayjs(data.ex).toDate() });
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Post("public/auth/accept-code")
    async AcceptCode(@Req() req: Request, @Res() res: Response) {
        try {
            const { email, code }: { email: string, code: string } = req.body;
            const resultAccept = await this.authService.AcceptCode(email, code);

            if (resultAccept instanceof Error) {
                throw new Error(`accept code error: ${resultAccept}`);
            }

            const resultProfile = await this.authService.CreateProfile(email, resultAccept);
            if (resultProfile instanceof Error) {
                throw new Error(`profile error ${resultProfile}`);
            }

            this.handleResponse.SuccessResponse(res, resultProfile);
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Post("public/auth/login")
    async Login(@Req() req: Request, @Res() res: Response) {
        try {
            const infoLogin: { email: string, password: string } = req.body;
            const profile = await this.authService.CheckUserLogin(infoLogin);

            if (profile instanceof Error) {
                throw new Error(`profile error: ${profile}`);
            }

            if(profile === null) {
                throw new Error("profile null");
            }

            const accessToken = this.jwtUtils.CreateToken({
                profile_id: profile.id,
                role_id: profile?.user?.role.id,
                email: profile.email,
                uuid: uuidv4().toString(),
            }, "access_token");

            const refreshToken = this.jwtUtils.CreateToken({
                profile_id: profile.id,
                role_id: profile?.user?.role.id,
                email: profile.email,
                uuid: uuidv4().toString(),
            }, "refresh_token");

            this.handleResponse.SuccessResponse(res, {
                accessToken,
                refreshToken,
                profile,
            });
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Post("public/auth/repeat-code")
    async SendRepeatCode(@Req() req: Request, @Res() res: Response) {
        try {
            const { email }: { email: string } = req.body as { email: string };
            const dataPending = await this.authService.GetDataCodePending(email);

            if (dataPending instanceof Error) {
                throw new Error(`get data code error: ${dataPending}`);
            }


            const createUserPending = await this.authService.CreatePendingUser(dataPending.data);
            if (createUserPending instanceof Error) {
                throw new Error(`create user pending error: ${createUserPending}`);
            }

            this.handleResponse.SuccessResponse(res, null);
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
}
import * as dayjs from 'dayjs'
import JwtUtils from "@/utils/jwt";

import { AuthService } from "@/modules/auth/auth.service";
import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { RegisterRequest } from "@/dto/request/auth";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { HandleResponse } from "@/utils/http";


@Controller("account/api/v1/public/auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtUtils: JwtUtils,
        private readonly handleResponse: HandleResponse
    ) {

    }

    @Get("ping")
    async Ping(@Req() req: Request, @Res() res: Response) {
        this.handleResponse.SuccessResponse(res, {
            mess: "OK",
        })
    }

    @Post("register")
    async Register(@Req() req: Request, @Res() res: Response) {
        try {
            const data: RegisterRequest = req.body;

            const resultCheckUser = await this.authService.CheckUser(data.email);
            if (resultCheckUser instanceof Error) {
                this.handleResponse.ErrorResponse(res, resultCheckUser);
                return;
            }
            if (resultCheckUser) {
                this.handleResponse.ErrorResponse(res, new Error("email exist"));
                return;
            }

            const resultSetRedisUserPending = await this.authService.CreatePendingUser(data);

            this.handleResponse.SuccessResponse(res, resultSetRedisUserPending);
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Post("refresh-token")
    async RefreshToken(@Req() req: Request, @Res() res: Response) {
        try {
            const token = req.headers?.authorization.split(" ")?.[1];

            if(!token) {
                this.handleResponse.UnAuthorization(res, new Error("not token"));
                return;
            }

            const result = await this.jwtUtils.VerifyToken(token);

            if(result instanceof Error) {
                this.handleResponse.UnAuthorization(res, new Error("error token"));
                return;
            }

            const infoSetToken = await this.authService.GetInfoSetToken(result.profile_id);
            if(infoSetToken instanceof Error) {
                throw new Error("info error");
            }

            const access_token = this.jwtUtils.CreateToken({
                ...infoSetToken,
                uuid: uuidv4().toString(),
            }, "access_token");

            const refresh_token = this.jwtUtils.CreateToken({
                ...infoSetToken,
                uuid: uuidv4().toString(),
            }, "refresh_token");

            this.handleResponse.SuccessResponse(res, {
                access_token,
                refresh_token,
                result,
            });
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Get("time-code-pending")
    async GetTimeCodePending(@Req() req: Request, @Res() res: Response) {
        try {
            const { email }: { email: string } = req.query as { email: string };
            const data = await this.authService.GetDataCodePending(email);
            if (data instanceof Error) {
                this.handleResponse.ErrorResponse(res, data);
                return;
            }

            this.handleResponse.SuccessResponse(res, { dataTime: dayjs(data.ex).toDate() });
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Post("accept-code")
    async AcceptCode(@Req() req: Request, @Res() res: Response) {
        try {
            const { email, code }: { email: string, code: string } = req.body;
            const resultAccept = await this.authService.AcceptCode(email, code);

            if (resultAccept instanceof Error) {
                this.handleResponse.ErrorResponse(res, resultAccept);
                return;
            }

            const resultProfile = await this.authService.CreateProfile(email, resultAccept);
            if (resultProfile instanceof Error) {
                this.handleResponse.ErrorResponse(res, resultProfile);
                return;
            }

            this.handleResponse.SuccessResponse(res, resultProfile);
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Post("login")
    async Login(@Req() req: Request, @Res() res: Response) {
        try {
            const infoLogin: { email: string, password: string } = req.body;
            const result = await this.authService.CheckUserLogin(infoLogin);

            if (result instanceof Error) {
                this.handleResponse.ErrorResponse(res, result);
                return;
            }

            if(result === null) {
                this.handleResponse.ErrorResponse(res, new Error("null"));
                return;
            }

            const access_token = this.jwtUtils.CreateToken({
                profile_id: result.id,
                role_id: result?.user?.role.id,
                email: result.email,
                uuid: uuidv4().toString(),
            }, "access_token");

            const refresh_token = this.jwtUtils.CreateToken({
                profile_id: result.id,
                role_id: result?.user?.role.id,
                email: result.email,
                uuid: uuidv4().toString(),
            }, "refresh_token");

            this.handleResponse.SuccessResponse(res, {
                access_token,
                refresh_token,
                result,
            });
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    @Post("repeat-code")
    async SendRepeatCode(@Req() req: Request, @Res() res: Response) {
        try {
            const { email }: { email: string } = req.body as { email: string };
            const dataPending = await this.authService.GetDataCodePending(email);

            if (dataPending instanceof Error) {
                this.handleResponse.ErrorResponse(res, dataPending);
                return;
            }


            const createUserPending = await this.authService.CreatePendingUser(dataPending.data);
            if (createUserPending instanceof Error) {
                this.handleResponse.ErrorResponse(res, createUserPending);
                return;
            }

            this.handleResponse.SuccessResponse(res, null);
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
}
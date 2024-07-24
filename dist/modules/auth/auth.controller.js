"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const dayjs = require("dayjs");
const jwt_1 = require("../../utils/jwt");
const auth_service_1 = require("./auth.service");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const http_1 = require("../../utils/http");
let AuthController = class AuthController {
    constructor(authService, jwtUtils, handleResponse) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
        this.handleResponse = handleResponse;
    }
    async Ping(req, res) {
        this.handleResponse.SuccessResponse(res, {
            mess: "OK",
        });
    }
    async Register(req, res) {
        try {
            const data = req.body;
            const resultCheckUser = await this.authService.CheckUser(data.email);
            if (resultCheckUser instanceof Error && resultCheckUser !== null) {
                throw new Error(`check user error: ${resultCheckUser}`);
            }
            if (resultCheckUser) {
                throw new Error("email exist");
            }
            const resultSetRedisUserPending = await this.authService.CreatePendingUser(data);
            this.handleResponse.SuccessResponse(res, resultSetRedisUserPending);
        }
        catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
    async RefreshToken(req, res) {
        try {
            const token = req.headers?.authorization.split(" ")?.[1];
            if (!token) {
                throw new Error(`not token`);
            }
            const result = await this.jwtUtils.VerifyToken(token);
            if (result instanceof Error) {
                throw new Error(`error token: ${result}`);
            }
            const infoSetToken = await this.authService.GetInfoSetToken(result.profile_id);
            if (infoSetToken instanceof Error) {
                throw new Error(`info error: ${infoSetToken}`);
            }
            const accessToken = this.jwtUtils.CreateToken({
                ...infoSetToken,
                uuid: (0, uuid_1.v4)().toString(),
            }, "access_token");
            const refreshToken = this.jwtUtils.CreateToken({
                ...infoSetToken,
                uuid: (0, uuid_1.v4)().toString(),
            }, "refresh_token");
            const profile = await this.authService.GetProfile(infoSetToken.profile_id);
            if (profile instanceof Error) {
                throw new Error("profile not found");
            }
            this.handleResponse.SuccessResponse(res, {
                accessToken,
                refreshToken,
                profile,
            });
        }
        catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
    async GetTimeCodePending(req, res) {
        try {
            const { email } = req.query;
            const data = await this.authService.GetDataCodePending(email);
            if (data instanceof Error) {
                throw new Error(`get time code error: ${data}`);
            }
            this.handleResponse.SuccessResponse(res, { dataTime: dayjs(data.ex).toDate() });
        }
        catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
    async AcceptCode(req, res) {
        try {
            const { email, code } = req.body;
            const resultAccept = await this.authService.AcceptCode(email, code);
            if (resultAccept instanceof Error) {
                throw new Error(`accept code error: ${resultAccept}`);
            }
            const resultProfile = await this.authService.CreateProfile(email, resultAccept);
            if (resultProfile instanceof Error) {
                throw new Error(`profile error ${resultProfile}`);
            }
            this.handleResponse.SuccessResponse(res, resultProfile);
        }
        catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
    async Login(req, res) {
        try {
            const infoLogin = req.body;
            const profile = await this.authService.CheckUserLogin(infoLogin);
            if (profile instanceof Error) {
                throw new Error(`profile error: ${profile}`);
            }
            if (profile === null) {
                throw new Error("profile null");
            }
            const accessToken = this.jwtUtils.CreateToken({
                profile_id: profile.id,
                role_id: profile?.user?.role.id,
                email: profile.email,
                uuid: (0, uuid_1.v4)().toString(),
            }, "access_token");
            const refreshToken = this.jwtUtils.CreateToken({
                profile_id: profile.id,
                role_id: profile?.user?.role.id,
                email: profile.email,
                uuid: (0, uuid_1.v4)().toString(),
            }, "refresh_token");
            this.handleResponse.SuccessResponse(res, {
                accessToken,
                refreshToken,
                profile,
            });
        }
        catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
    async SendRepeatCode(req, res) {
        try {
            const { email } = req.body;
            const dataPending = await this.authService.GetDataCodePending(email);
            if (dataPending instanceof Error) {
                throw new Error(`get data code error: ${dataPending}`);
            }
            const createUserPending = await this.authService.CreatePendingUser(dataPending.data);
            if (createUserPending instanceof Error) {
                throw new Error(`create user pending error: ${createUserPending}`);
            }
            this.handleResponse.SuccessResponse(res, null);
        }
        catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)("public/auth/ping"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "Ping", null);
__decorate([
    (0, common_1.Post)("public/auth/register"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "Register", null);
__decorate([
    (0, common_1.Post)("protected/auth/refresh-token"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "RefreshToken", null);
__decorate([
    (0, common_1.Get)("public/auth/time-code-pending"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "GetTimeCodePending", null);
__decorate([
    (0, common_1.Post)("public/auth/accept-code"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "AcceptCode", null);
__decorate([
    (0, common_1.Post)("public/auth/login"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "Login", null);
__decorate([
    (0, common_1.Post)("public/auth/repeat-code"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "SendRepeatCode", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("account/api/v1"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.default,
        http_1.HandleResponse])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
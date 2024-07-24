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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const http_1 = require("../../utils/http");
const jwt_1 = require("../../utils/jwt");
const common_1 = require("@nestjs/common");
let AuthMiddleware = class AuthMiddleware {
    constructor() {
        this.jwtUtils = new jwt_1.default();
        this.handleResponse = new http_1.HandleResponse();
    }
    async use(req, res, next) {
        try {
            const token = (req.headers.authorization || "").split(" ")?.[1];
            if (!token) {
                this.handleResponse.UnAuthorization(res, new Error("not token"));
                return;
            }
            const result = await this.jwtUtils.VerifyToken(token);
            if (result instanceof Error) {
                this.handleResponse.UnAuthorization(res, result);
                return;
            }
            next();
        }
        catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map
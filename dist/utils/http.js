"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleResponse = void 0;
const common_1 = require("@nestjs/common");
let HandleResponse = class HandleResponse {
    ErrorResponse(res, err) {
        const dataRes = {
            data: null,
            message: err.message,
            error: err,
            status: 502,
        };
        res.status(502).json(dataRes);
    }
    UnAuthorization(res, err) {
        const dataRes = {
            data: null,
            message: err.message,
            error: err,
            status: 401,
        };
        res.status(401).json(dataRes);
    }
    SuccessResponse(res, data) {
        const dataRes = {
            data: data,
            message: "OK",
            error: null,
            status: 200,
        };
        res.status(200).json(dataRes);
    }
};
exports.HandleResponse = HandleResponse;
exports.HandleResponse = HandleResponse = __decorate([
    (0, common_1.Injectable)()
], HandleResponse);
//# sourceMappingURL=http.js.map
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
const jwt = require("jsonwebtoken");
const fs = require("fs");
const common_1 = require("@nestjs/common");
let JwtUtils = class JwtUtils {
    constructor() {
        this.privateKey = fs.readFileSync('src/keys/private.key');
    }
    CreateToken(payload, type) {
        const token = jwt.sign(payload, this.privateKey, {
            expiresIn: 24 * 60 * 60 * (type === "access_token" ? 1 : 3),
            algorithm: "RS256",
        });
        return token;
    }
    async VerifyToken(token) {
        try {
            const data = jwt.verify(token, this.privateKey);
            return data;
        }
        catch (error) {
            return error;
        }
    }
};
JwtUtils = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtUtils);
exports.default = JwtUtils;
//# sourceMappingURL=jwt.js.map
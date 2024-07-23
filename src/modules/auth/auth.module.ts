import JwtUtils from "@/utils/jwt";

import { AuthService } from "@/modules/auth/auth.service";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { HandleResponse } from "@/utils/http";
import { AuthMiddleware } from "./auth.middleware";

@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtUtils, HandleResponse],
})
export class AuthModule implements NestModule { 
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(
                { path: "account/api/v1/public/auth/refresh-token", method: RequestMethod.POST }
            )
    }
};
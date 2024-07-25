import JwtUtils from "@/utils/jwt";

import { AuthService } from "@/modules/auth/index.service";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { AuthController } from "./index.controller";
import { HandleResponse } from "@/utils/http";
import { AuthMiddleware } from "./index.middleware";
import { PgModule } from "@/shared/pg/index.module";
import { SmtpModule } from "@/shared/smtp/index.module";

@Module({
    imports: [PgModule, SmtpModule],
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
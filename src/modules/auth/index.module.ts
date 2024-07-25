import { AuthService } from "@/modules/auth/index.service";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { AuthController } from "./index.controller";
import { AuthMiddleware } from "./index.middleware";
import { PgModule } from "@/shared/pg/index.module";
import { SmtpModule } from "@/shared/smtp/index.module";
import { JwtModule } from "@/shared/jwt/index.module";
import { HttpModule } from "@/shared/http/index.module";
import { BcryptModule } from "@/shared/bcrypt/index.module";

@Module({
    imports: [PgModule, SmtpModule, BcryptModule, JwtModule, HttpModule],
    controllers: [AuthController],
    providers: [AuthService],
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
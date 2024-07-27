import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MessController } from "./index.controller";
import { MessService } from "./index.service";
import { HttpModule } from "@/shared/http/index.module";
import { JwtModule } from "@/shared/jwt/index.module";
import { PgModule } from "@/shared/pg/index.module";

@Module({
    imports: [HttpModule, JwtModule, PgModule],
    controllers: [MessController],
    providers: [MessService],
})
export class MessModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.
            apply(AuthMiddleware)
            .forRoutes("*")
    }
}
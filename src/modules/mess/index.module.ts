import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MessController } from "./index.controller";
import { MessService } from "./index.service";
import { HttpModule } from "@/shared/http/index.module";
import { JwtModule } from "@/shared/jwt/index.module";
import { PgModule } from "@/shared/pg/index.module";
import { MongodbModule } from "@/shared/mongodb/index.module";

@Module({
    imports: [HttpModule, JwtModule, PgModule, MongodbModule],
    controllers: [MessController],
    providers: [MessService],
    exports: [MessService],
})
export class MessModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.
            apply(AuthMiddleware)
            .forRoutes("mess/api/v1/protected/*")
    }
}
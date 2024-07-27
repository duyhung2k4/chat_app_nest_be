import { HttpModule } from "@/shared/http/index.module";
import { PgModule } from "@/shared/pg/index.module";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { SearchController } from "./index.controller";
import { SearchService } from "./index.service";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { JwtModule } from "@/shared/jwt/index.module";

@Module({
    imports: [PgModule, HttpModule, JwtModule],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes("*")
    }
};
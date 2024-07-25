import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/index.module';
import { MorganMiddleware } from '@/middlewares/morgan.middleware';
import { WebSocketModule } from './web_socket/index.module';

@Module({
    imports: [
        AuthModule,
        WebSocketModule,
    ],
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(MorganMiddleware).forRoutes("*")
    }
}
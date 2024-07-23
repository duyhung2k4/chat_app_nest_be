import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MorganMiddleware } from '@/middlewares/morgan.middleware';

@Module({
  imports: [AuthModule],
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(MorganMiddleware).forRoutes("*")
    }
}
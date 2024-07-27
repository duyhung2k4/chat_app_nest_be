import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/index.module';
import { MorganMiddleware } from '@/middlewares/morgan.middleware';
import { WebSocketModule } from './web_socket/index.module';
import { PgModule } from '@/shared/pg/index.module';
import { MongodbModule } from '@/shared/mongodb/index.module';
import { RabbitMQModule } from '@/shared/rabbitmq/index.module';
import { SearchModule } from './search/index.module';
import { MessModule } from './mess/index.module';

@Module({
    imports: [
        PgModule,
        MongodbModule,
        RabbitMQModule,
        
        AuthModule,
        SearchModule,
        WebSocketModule,
        MessModule,
    ],
})
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(MorganMiddleware).forRoutes("*")
    }
}
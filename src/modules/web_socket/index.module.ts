import { Module } from "@nestjs/common";
import { WebSocketController } from "./index.controller";
import { RabbitMQModule } from "@/shared/rabbitmq/index.module";
import { JwtModule } from "@/shared/jwt/index.module";
import { MessModule } from "../mess/index.module";

@Module({
    imports: [RabbitMQModule, JwtModule, MessModule],
    controllers: [WebSocketController]
})
export class WebSocketModule { }
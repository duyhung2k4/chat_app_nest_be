import { Module } from "@nestjs/common";
import { WebSocketController } from "./index.controller";
import { RabbitMQModule } from "@/shared/rabbitmq/index.module";

@Module({
    imports: [RabbitMQModule],
    controllers: [WebSocketController]
})
export class WebSocketModule { }
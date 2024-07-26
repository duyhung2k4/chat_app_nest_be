import { Module } from "@nestjs/common";
import { RabbitMQService } from "./index.service";

@Module({
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {}
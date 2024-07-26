import { Module } from "@nestjs/common";
import { RabbitMQService } from "./index.service";
import { MongodbModule } from "../mongodb/index.module";

@Module({
    imports: [MongodbModule],
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {}
import { Module } from "@nestjs/common";
import { RedisService } from "./index.service";

@Module({
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule {}
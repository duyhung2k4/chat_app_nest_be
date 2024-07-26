import { Module } from "@nestjs/common";
import { MongodbService } from "./index.service";

@Module({
    providers: [MongodbService],
    exports: [MongodbService],
})
export class MongodbModule {}
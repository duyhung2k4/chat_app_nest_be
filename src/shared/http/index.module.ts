import { Module } from "@nestjs/common";
import { HttpService } from "./index.service";

@Module({
    providers: [HttpService],
    exports: [HttpService],
})
export class HttpModule {}
import { Module } from "@nestjs/common";
import { BcryptService } from "./index.service";

@Module({
    providers: [BcryptService],
    exports: [BcryptService],
})
export class BcryptModule {}
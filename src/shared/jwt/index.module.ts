import { Module } from "@nestjs/common";
import { JwtService } from "./index.service";

@Module({
    providers: [JwtService],
    exports: [JwtService],
})
export class JwtModule {}
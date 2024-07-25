import { Module } from "@nestjs/common";
import { SmtpService } from "./index.service";

@Module({
    providers: [SmtpService],
    exports: [SmtpService]
})
export class SmtpModule {}
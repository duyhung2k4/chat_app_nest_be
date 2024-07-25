import { Module } from "@nestjs/common";
import { PgService } from "./index.service";

@Module({
    providers: [PgService],
    exports: [PgService],
})
export class PgModule {}
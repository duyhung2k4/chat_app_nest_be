import { Module } from "@nestjs/common";
import { WebSocketController } from "./index.controller";

@Module({
    controllers: [WebSocketController]
})
export class WebSocketModule { }
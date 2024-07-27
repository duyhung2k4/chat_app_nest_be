import { Controller, Post, Req, Res } from "@nestjs/common";
import { MessService } from "./index.service";
import { Request, Response } from "express";
import { HttpService } from "@/shared/http/index.service";
import { CreateBoxChatReq } from "@/dto/request/mess";

@Controller("mess/api/v1")
export class MessController {
    constructor(
        private readonly messService: MessService,
        private readonly httpService: HttpService,
    ) {}

    @Post("protected/create_box_chat")
    async CreateBoxChat(@Req() req: Request, @Res() res: Response) {
        try {
            const payload: CreateBoxChatReq = req.body;
            const result = await this.messService.CreateBoxChat(payload);

            this.httpService.SuccessResponse(res, result);
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }
}
import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { MessService } from "./index.service";
import { Request, Response } from "express";
import { HttpService } from "@/shared/http/index.service";
import { AddMemberGroupChatReq, CreateBoxChatReq, CreateGroupChatReq } from "@/dto/request/mess";
import { MessControllerInterface } from "./index.interface";
import { JwtService } from "@/shared/jwt/index.service";
import { BoxChatModel } from "@/models/box_chat";
import { ProfileGroupChatModel } from "@/models/profile_group_chat";

@Controller("mess/api/v1")
export class MessController implements MessControllerInterface {
    constructor(
        private readonly messService: MessService,
        private readonly httpService: HttpService,
        private readonly jwtService: JwtService,
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

    @Post("protected/create_group_chat")
    async CreateGroupChat(@Req() req: Request, @Res() res: Response) {
        try {
            const token = (req.headers.authorization || "").split(" ")?.[1];
            if(!token) {
                throw new Error("token error");
            }
            const tokenInfoResult = await this.jwtService.VerifyToken(token);

            const payload: CreateGroupChatReq = req.body;
            payload.createId = tokenInfoResult.profile_id;
            const result = await this.messService.CreateGroupChat(payload);

            this.httpService.SuccessResponse(res, result);
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }

    @Post("protected/add_member_group_chat")
    async AddMemberGroupChat(@Req() req: Request, @Res() res: Response) {
        try {
            const token = (req.headers.authorization || "").split(" ")?.[1];
            if(!token) {
                throw new Error("token error");
            }

            const payload: AddMemberGroupChatReq = req.body;

            const tokenInfoResult = await this.jwtService.VerifyToken(token);
            const inGroupChat = await this.messService.InGroupChat(tokenInfoResult.profile_id, payload.groupChatId);
            if(!inGroupChat) {
                throw new Error("not permission add member");
            }

            const result = await this.messService.AddMemberGroupChat(payload);

            this.httpService.SuccessResponse(res, result);
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }

    @Get("protected/load_mess")
    async LoadMess(@Req() req: Request, @Res() res: Response) {
        try {
            const { id, type_mess } = req.query as { id: string, type_mess: "box_chat" | "group_chat" };
            if(!id) {
                throw new Error("id null");
            }
            
            const result = await this.messService.LoadMess(Number(id), type_mess);

            this.httpService.SuccessResponse(res, result);
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }

    @Get("protected/box_chat")
    async GetBoxChat(@Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            const { profile_id } = this.jwtService.GetTokenResut(req.headers.authorization);
            const result: BoxChatModel[] = await this.messService.GetBoxChat(profile_id);
            
            this.httpService.SuccessResponse(res, result);
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }

    @Get("protected/profile_group_chat")
    async GetProfileGroupChat(@Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            const { profile_id } = this.jwtService.GetTokenResut(req.headers.authorization);
            const result: ProfileGroupChatModel[] = await this.messService.GetProfileGroupChat(profile_id);
            
            this.httpService.SuccessResponse(res, result);
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }

    @Get("protected/member_group_chat")
    async GetMemberGroupChat(@Req() req: Request, @Res() res: Response): Promise<void> {
        try {
            const { id } = req.query as { id: string };
            const result: ProfileGroupChatModel[] = await this.messService.GetMemberGroupChat(Number(id));
            
            this.httpService.SuccessResponse(res, result);
        } catch (error) {
            this.httpService.ErrorResponse(res, error);
        }
    }
}
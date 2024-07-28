import { CreateBoxChatReq } from "@/dto/request/mess";
import { BoxChatModel } from "@/models/box_chat";
import { MessModel } from "@/models/mess";
import { Request, Response } from "express";

export interface MessControllerInterface {
    CreateBoxChat(req: Request, res: Response): Promise<void>
    LoadMess(req: Request, res: Response): Promise<void>
}

export interface MessServiceInterface {
    CreateBoxChat(payload: CreateBoxChatReq): Promise<BoxChatModel>
    LoadMess(boxChatId: number): Promise<MessModel[]>
}
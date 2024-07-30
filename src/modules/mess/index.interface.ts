import { AddMemberGroupChatReq, CreateBoxChatReq, CreateGroupChatReq } from "@/dto/request/mess";
import { BoxChatModel } from "@/models/box_chat";
import { GroupChatModel } from "@/models/group_chat";
import { MessModel } from "@/models/mess";
import { ProfileGroupChatModel } from "@/models/profile_group_chat";
import { Request, Response } from "express";

export interface MessControllerInterface {
    CreateBoxChat(req: Request, res: Response): Promise<void>
    CreateGroupChat(req: Request, res: Response): Promise<void>
    AddMemberGroupChat(req: Request, res: Response): Promise<void>
    LoadMess(req: Request, res: Response): Promise<void>
    GetBoxChat(req: Request, res: Response) : Promise<void>
    GetProfileGroupChat(req: Request, res: Response) : Promise<void>
}

export interface MessServiceInterface {
    CreateBoxChat(payload: CreateBoxChatReq): Promise<BoxChatModel>
    CreateGroupChat(payload: CreateGroupChatReq): Promise<GroupChatModel>
    AddMemberGroupChat(payload: AddMemberGroupChatReq): Promise<ProfileGroupChatModel>
    InGroupChat(profileId: number, groupChatId: number): Promise<boolean>
    LoadMess(boxChatId: number): Promise<MessModel[]>
    GetBoxChat(profileId: number): Promise<BoxChatModel[]>
    GetProfileGroupChat(profileId: number): Promise<ProfileGroupChatModel[]>
}
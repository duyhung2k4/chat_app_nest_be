import { BaseModel } from "./base";
import { GroupChatModel } from "./group_chat";
import { ProfileModel } from "./profile";

export type ProfileGroupChatModel = BaseModel & {
    profile_id: number
    group_chat_id: number

    profile?: ProfileModel
    group_chat?: GroupChatModel
}
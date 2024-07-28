import { BaseModel } from "./base";
import { GroupChatModel } from "./group_chat";
import { ProfileModel } from "./profile";

export type ProfileGroupChatModel = BaseModel & {
    profile_id: Number
    group_chat_id: Number

    profile?: ProfileModel
    group_chat?: GroupChatModel
}
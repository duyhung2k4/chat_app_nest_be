import { BaseModel } from "./base";
import { ProfileModel } from "./profile";
import { ProfileGroupChatModel } from "./profile_group_chat";

export type GroupChatModel = BaseModel & {
    create_id: number

    profile?: ProfileModel
    profile_group_chat?: ProfileGroupChatModel[]
}
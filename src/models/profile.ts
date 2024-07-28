import { BaseModel } from "./base";
import { BoxChatModel } from "./box_chat";
import { GroupChatModel } from "./group_chat";
import { ProfileGroupChatModel } from "./profile_group_chat";
import { UserModel } from "./user";

export type ProfileModel = BaseModel & {
    first_name: string
    last_name: string
    email: string
    address: string
    gender: string
    age: number
    user_id: number

    user?: UserModel
    from_box_chats?: BoxChatModel[]
    to_box_chats?: BoxChatModel[]
    group_chats?: GroupChatModel[]
    profile_group_chat?: ProfileGroupChatModel[]
}
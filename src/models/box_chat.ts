import { BaseModel } from "./base";
import { ProfileModel } from "./profile";

export type BoxChatModel = BaseModel & {
    from_id: number
    to_id: number

    from_profile?: ProfileModel
    to_profile?: ProfileModel
}
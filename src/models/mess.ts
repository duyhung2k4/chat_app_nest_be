import { BaseModel } from "./base";

export type MessModel = BaseModel & {
    from_id: number
    to_id: number
    box_chat_id: number | null
    group_chat_id: number | null
    data: string
}

export const MESS_FIELD_REQUIRE = ["from_id", "to_id", "data", "box_chat_id", "group_chat_id"];
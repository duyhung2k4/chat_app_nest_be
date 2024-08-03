import { BaseModel } from "./base";

export type MessModel = {
    _id: number
    from_id: number
    to_id: number | null
    box_chat_id: number | null
    group_chat_id: number | null
    mess_rep_id: string | null // get from uuid
    uuid: string
    data: string
    created_at: Date | string
    deleted_at?: Date | string
    updated_at?: Date | string
}

export const MESS_FIELD_REQUIRE = ["from_id", "to_id", "data", "box_chat_id", "group_chat_id", "mess_rep_id", "uuid"];
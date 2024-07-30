export const COLUMN_BASE = ["id", "created_at", "updated_at", "deleted_at"];

export const COLUMN_TABLE = {
    roles: [...COLUMN_BASE, "name", "code"],
    user: [...COLUMN_BASE, "email", "role_id", "password", "active"],
    profiles: [...COLUMN_BASE, "first_name","last_name","email","address","gender","age","user_id"],
    box_chats: [...COLUMN_BASE, "from_id", "to_id"],
    group_chats: [...COLUMN_BASE, "create_id"],
    profile_group_chats: [...COLUMN_BASE, "profile_id", "group_chat_id"],
}
export type BaseModel = {
    id: number;
    created_at: Date | string;
    deleted_at?: Date | string;
    updated_at?: Date | string;
};

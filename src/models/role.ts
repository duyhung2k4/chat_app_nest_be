import { BaseModel } from "./base";

export type RoleModel = BaseModel & {
    name: string
    code: string
}
import { BaseModel } from "./base";
import { UserModel } from "./user";

export type RoleModel = BaseModel & {
    name: string
    code: string

    users?: UserModel[]
}
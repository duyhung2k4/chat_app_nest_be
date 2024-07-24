import { BaseModel } from "./base";
import { RoleModel } from "./role";
export type UserModel = BaseModel & {
    role_id: number;
    email: string;
    password: string;
    active: boolean;
    role?: RoleModel;
};

import { BaseModel } from "./base";
import { UserModel } from "./user";
export type ProfileModel = BaseModel & {
    first_name: string;
    last_name: string;
    email: string;
    address: string;
    gender: string;
    age: number;
    user_id: number;
    user?: UserModel;
};

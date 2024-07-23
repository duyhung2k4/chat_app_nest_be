import { Injectable } from "@nestjs/common";
import { hashSync, genSaltSync, compare } from "bcrypt";

@Injectable()
class AuthUtils {
    HashPassword (password: string): string | Error {
        const salt = genSaltSync(14);
        const hashString = hashSync(password, salt);
        return hashString;
    }

    async ComparePassword(password: string, passwordHash: string): Promise<boolean | Error> {
        try {
            const result = await compare(password, passwordHash);
            return result;
        } catch (error) {
            return error;
        }
    }
}

export default AuthUtils;
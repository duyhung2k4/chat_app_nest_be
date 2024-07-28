import * as dayjs from "dayjs";
import SMTPTransport from "nodemailer/lib/smtp-transport";

import { TABLE } from "@/constants/query";
import { COLUMN_TABLE } from "@/constants/table";
import { RegisterRequest } from "@/dto/request/auth";
import { ProfileModel } from "@/models/profile";
import { UserModel } from "@/models/user";
import { Injectable } from "@nestjs/common";
import { Client, QueryConfig } from "pg";
import { PgService } from "@/shared/pg/index.service";
import { RedisClientType } from "redis";
import { SmtpService } from "@/shared/smtp/index.service";
import { Transporter } from "nodemailer";
import { BcryptService } from "@/shared/bcrypt/index.service";
import { RedisService } from "@/shared/redis/index.service";
import { AuthServiceInterface } from "./index.interface";



@Injectable()
export class AuthService implements AuthServiceInterface {
    private initialized: Promise<void>;
    private clientPg: Client;
    private clientRedis: RedisClientType;
    private clientEmail: Transporter<SMTPTransport.SentMessageInfo>;
    
    constructor(
        private readonly pgService: PgService,
        private readonly redisService: RedisService,
        private readonly smtpService: SmtpService,
        private readonly bcryptService: BcryptService,
    ) {
        this.initialized = this.init();
    }
    
    private async init() {
        try {
            this.clientEmail = this.smtpService.GetEmailTransporter();
            this.clientRedis = await this.redisService.GetClientRedis();
            this.clientPg = await this.pgService.GetClientPg();
        } catch (error) {
            return error;
        }
    }

    async GetProfile(profileId: number): Promise<ProfileModel | Error> {
        try {
            const columnProfile = COLUMN_TABLE.profiles.map(c => `p.${c} as p__${c}`);
            const columnUser = COLUMN_TABLE.user.map(c => `u.${c} as u__${c}`);
            const columnRole = COLUMN_TABLE.roles.map(c => `r.${c} as r__${c}`);

            const queryConfig: QueryConfig = {
                text: `
                    SELECT
                        ${columnProfile.join(",")},
                        ${columnUser.join(",")},
                        ${columnRole.join(",")}
                    FROM profiles as p
                    JOIN users as u ON u.id = p.user_id
                    JOIN roles as r ON r.id = u.role_id
                    WHERE p.id = $1
                `,
                values: [profileId]
            }

            const result = await this.clientPg.query<Record<string, any>>(queryConfig);

            if(result.rowCount === 0) {
                throw new Error("data null");
            }
            

            let dataMap: Record<string, any> = {
                user: {
                    role: {},
                },
            };
            const data = result.rows[0];
            Object.keys(data).forEach(key => {
                const field = key.split("__")[1];
                if (!field) return;
                switch (key.split("__")[0]) {
                    case "p":
                        dataMap[field] = data[key];
                        break;
                    case "u":
                        dataMap.user[field] = data[key];
                        break;
                    case "r":
                        dataMap.user.role[field] = data[key];
                        break;
                    default:
                        break;
                }
            });

            const profile = dataMap as ProfileModel;
            delete profile?.user.password;

            return profile;
        } catch (error) {
            return error;
        }
    }

    async GetInfoSetToken(profileId: number): Promise<GetInfoSetTokenResponse | Error> {
        try {
            const queryConfig: QueryConfig = {
                text: `
                    SELECT
                        p.id as profile_id,
                        r.id as role_id,
                        u.email as email
                    FROM profiles as p
                    JOIN users as u ON u.id = p.user_id
                    JOIN roles as r ON r.id = u.role_id
                    WHERE p.id = $1
                `,
                values: [profileId]
            }

            const result = await this.clientPg.query<GetInfoSetTokenResponse>(queryConfig);

            if(result.rows.length === 0) {
                throw new Error("data null");
            }

            return result.rows[0];
        } catch (error) {
            return error;
        }
    }

    async CheckUser(email: string): Promise<UserModel | null | Error> {
        try {
            const queryConfig: QueryConfig = {
                text: `SELECT * FROM ${TABLE.USER} WHERE email = $1`,
                values: [email]
            }

            const result = await this.clientPg.query<UserModel>(queryConfig);

            if(result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            return error;
        }
    }

    async CreatePendingUser(payload: RegisterRequest): Promise<any | Error> {
        try {
            const code: string = `${Math.floor(100000 + Math.random() * 900000)}`;

            const data: TypeRedisCreatePendingUser = {
                data: payload,
                code,
                ex: dayjs().add(30, "second"),
            }

            await this.clientRedis.del(`sign_in_${payload.email}`);

            await this.clientRedis.set(
                `sign_in_${payload.email}`,
                JSON.stringify(data),
                {
                    EX: 60,
                    NX: true,
                }
            );

            await this.clientEmail.sendMail({
                from: "D.Hung",
                to: payload.email,
                subject: "Mã xác nhận",
                text: code,
            });

            return null;
        } catch (error) {
            return error;
        }
    }

    async AcceptCode(email: string, code: string): Promise<string | Error> {
        try {
            const jsonStringData = await this.clientRedis.get(`sign_in_${email}`);
            const data = JSON.parse(jsonStringData) as TypeRedisCreatePendingUser;

            if (!data || data?.code !== code) return null;

            const passwordHash = this.bcryptService.HashPassword(data.data.password);
            return passwordHash;
        } catch (error) {
            return error;
        }
    }

    async CreateProfile(email: string, passwordHash: string): Promise<ProfileModel | Error> {
        try {
            const infoUserPendingString = await this.clientRedis.get(`sign_in_${email}`);
            const infoUserPending = JSON.parse(infoUserPendingString) as TypeRedisCreatePendingUser;

            await this.clientPg.query("BEGIN");
            const id = await this.getRole();
            if (id === null) return null;

            const queryConfigUser: QueryConfig = {
                text: `INSERT INTO users (email, password, role_id) values ($1, $2, $3) RETURNING *`,
                values: [email, passwordHash, id]
            };
            const resultUser = await this.clientPg.query<UserModel>(queryConfigUser);
            const newUser = resultUser.rows[0];

            const queryConfigProfile: QueryConfig = {
                text: `INSERT INTO profiles (first_name, last_name, email, user_id) values ($1, $2, $3, $4) RETURNING *`,
                values: [
                    infoUserPending.data.firstName,
                    infoUserPending.data.lastName,
                    email,
                    newUser.id
                ],
            }
            const resultProfile = await this.clientPg.query<ProfileModel>(queryConfigProfile);

            await this.clientPg.query("COMMIT");

            this.clientRedis.del(`sign_in_${resultProfile.rows[0].email}`);

            if(resultProfile.rows.length === 0) {
                throw new Error("data null");
            }

            return resultProfile.rows[0];
        } catch (error) {
            await this.clientPg.query("ROLLBACK");
            return error
        }
    }

    async CheckUserLogin(infoLogin: { email: string, password: string }): Promise<ProfileModel | Error> {
        try {
            const columnProfile = COLUMN_TABLE.profiles.map(c => `p.${c} as p__${c}`);
            const columnUser = COLUMN_TABLE.user.map(c => `u.${c} as u__${c}`);
            const columnRole = COLUMN_TABLE.roles.map(c => `r.${c} as r__${c}`);

            const queryConfig: QueryConfig = {
                text: `
                    SELECT
                        ${columnProfile.join(",")},
                        ${columnUser.join(",")},
                        ${columnRole.join(",")}
                    FROM profiles as p
                    JOIN users as u ON u.id = p.user_id
                    JOIN roles as r ON r.id = u.role_id
                    WHERE 
                        u.email = $1 
                        AND p.deleted_at IS NULL
                        AND u.deleted_at IS NULL
                        AND r.deleted_at IS NULL
                `,
                values: [infoLogin.email],
            };

            const result = await this.clientPg.query<Record<string, any>>(queryConfig);

            if(result.rowCount === 0) {
                throw new Error("data null");
            }
            

            let dataMap: Record<string, any> = {
                user: {
                    role: {},
                },
            };
            const data = result.rows[0];
            Object.keys(data).forEach(key => {
                const field = key.split("__")[1];
                if (!field) return;
                switch (key.split("__")[0]) {
                    case "p":
                        dataMap[field] = data[key];
                        break;
                    case "u":
                        dataMap.user[field] = data[key];
                        break;
                    case "r":
                        dataMap.user.role[field] = data[key];
                        break;
                    default:
                        break;
                }
            });

            const profile = dataMap as ProfileModel;

            const ok = await this.bcryptService.ComparePassword(infoLogin.password, profile?.user.password);
            if (!ok) {
                throw new Error("password wrong");
            };
            

            delete profile?.user.password;

            return profile;
        } catch (error) {
            return error;
        }
    }

    async GetDataCodePending(email: string): Promise<TypeRedisCreatePendingUser | Error> {
        try {
            const stringData = await this.clientRedis.get(`sign_in_${email}`);
            const infoPending = JSON.parse(stringData) as TypeRedisCreatePendingUser;
            return infoPending;
        } catch (error) {
            return error;
        }
    }

    private async getRole(): Promise<number | null> {
        try {
            const queryConfig: QueryConfig = {
                text: "SELECT id FROM roles WHERE code = $1 AND deleted_at IS NULL",
                values: ["user"]
            }

            const result = await this.clientPg.query<{ id: number }>(queryConfig);

            if(result.rows.length === 0) {
                throw new Error("data null");
            }

            return result.rows[0].id;
        } catch (error) {
            return null
        }
    }
}

export type TypeRedisCreatePendingUser = {
    data: RegisterRequest
    code: string
    ex: dayjs.Dayjs
}

export type GetInfoSetTokenResponse = {
    profile_id: number
    role_id: number
    email: string
}
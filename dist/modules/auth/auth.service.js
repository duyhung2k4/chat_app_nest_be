"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const dayjs = require("dayjs");
const auth_1 = require("../../utils/auth");
const connect_1 = require("../../config/connect");
const email_1 = require("../../config/email");
const query_1 = require("../../constants/query");
const table_1 = require("../../constants/table");
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    constructor() {
        this.clientPg = connect_1.clientPg;
        this.clientRedis = connect_1.clientRedis;
        this.clientEmail = email_1.emailTransporter;
        this.authUtils = new auth_1.default();
    }
    async GetProfile(profileId) {
        try {
            const columnProfile = table_1.COLUMN_TABLE.profiles.map(c => `p.${c} as p__${c}`);
            const columnUser = table_1.COLUMN_TABLE.user.map(c => `u.${c} as u__${c}`);
            const columnRole = table_1.COLUMN_TABLE.roles.map(c => `r.${c} as r__${c}`);
            const queryConfig = {
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
            };
            const result = await this.clientPg.query(queryConfig);
            if (result.rowCount === 0) {
                throw new Error("data null");
            }
            let dataMap = {
                user: {
                    role: {},
                },
            };
            const data = result.rows[0];
            Object.keys(data).forEach(key => {
                const field = key.split("__")[1];
                if (!field)
                    return;
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
            const profile = dataMap;
            delete profile?.user.password;
            return profile;
        }
        catch (error) {
            return error;
        }
    }
    async GetInfoSetToken(profileId) {
        try {
            const queryConfig = {
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
            };
            const result = await this.clientPg.query(queryConfig);
            if (result.rows.length === 0) {
                throw new Error("data null");
            }
            return result.rows[0];
        }
        catch (error) {
            return error;
        }
    }
    async CheckUser(email) {
        try {
            const queryConfig = {
                text: `SELECT * FROM ${query_1.TABLE.USER} WHERE email = $1`,
                values: [email]
            };
            const result = await this.clientPg.query(queryConfig);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        }
        catch (error) {
            return error;
        }
    }
    async CreatePendingUser(payload) {
        try {
            const code = `${Math.floor(100000 + Math.random() * 900000)}`;
            const data = {
                data: payload,
                code,
                ex: dayjs().add(30, "second"),
            };
            await this.clientRedis.del(`sign_in_${payload.email}`);
            await this.clientRedis.set(`sign_in_${payload.email}`, JSON.stringify(data), {
                EX: 60,
                NX: true,
            });
            await this.clientEmail.sendMail({
                from: "D.Hung",
                to: payload.email,
                subject: "Mã xác nhận",
                text: code,
            });
            return null;
        }
        catch (error) {
            return error;
        }
    }
    async AcceptCode(email, code) {
        try {
            const jsonStringData = await this.clientRedis.get(`sign_in_${email}`);
            const data = JSON.parse(jsonStringData);
            if (!data || data?.code !== code)
                return null;
            const passwordHash = this.authUtils.HashPassword(data.data.password);
            return passwordHash;
        }
        catch (error) {
            return error;
        }
    }
    async CreateProfile(email, passwordHash) {
        try {
            const infoUserPendingString = await this.clientRedis.get(`sign_in_${email}`);
            const infoUserPending = JSON.parse(infoUserPendingString);
            await this.clientPg.query("BEGIN");
            const id = await this.getRole();
            if (id === null)
                return null;
            const queryConfigUser = {
                text: `INSERT INTO users (email, password, role_id) values ($1, $2, $3) RETURNING *`,
                values: [email, passwordHash, id]
            };
            const resultUser = await this.clientPg.query(queryConfigUser);
            const newUser = resultUser.rows[0];
            const queryConfigProfile = {
                text: `INSERT INTO profiles (first_name, last_name, email, user_id) values ($1, $2, $3, $4) RETURNING *`,
                values: [
                    infoUserPending.data.firstName,
                    infoUserPending.data.lastName,
                    email,
                    newUser.id
                ],
            };
            const resultProfile = await this.clientPg.query(queryConfigProfile);
            await this.clientPg.query("COMMIT");
            this.clientRedis.del(`sign_in_${resultProfile.rows[0].email}`);
            if (resultProfile.rows.length === 0) {
                throw new Error("data null");
            }
            return resultProfile.rows[0];
        }
        catch (error) {
            await this.clientPg.query("ROLLBACK");
            return error;
        }
    }
    async CheckUserLogin(infoLogin) {
        try {
            const columnProfile = table_1.COLUMN_TABLE.profiles.map(c => `p.${c} as p__${c}`);
            const columnUser = table_1.COLUMN_TABLE.user.map(c => `u.${c} as u__${c}`);
            const columnRole = table_1.COLUMN_TABLE.roles.map(c => `r.${c} as r__${c}`);
            const queryConfig = {
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
            const result = await this.clientPg.query(queryConfig);
            if (result.rowCount === 0) {
                throw new Error("data null");
            }
            let dataMap = {
                user: {
                    role: {},
                },
            };
            const data = result.rows[0];
            Object.keys(data).forEach(key => {
                const field = key.split("__")[1];
                if (!field)
                    return;
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
            const profile = dataMap;
            const ok = await this.authUtils.ComparePassword(infoLogin.password, profile?.user.password);
            if (!ok) {
                throw new Error("password wrong");
            }
            ;
            delete profile?.user.password;
            return profile;
        }
        catch (error) {
            return error;
        }
    }
    async GetDataCodePending(email) {
        try {
            const stringData = await this.clientRedis.get(`sign_in_${email}`);
            const infoPending = JSON.parse(stringData);
            return infoPending;
        }
        catch (error) {
            return error;
        }
    }
    async getRole() {
        try {
            const queryConfig = {
                text: "SELECT id FROM roles WHERE code = $1 AND deleted_at IS NULL",
                values: ["user"]
            };
            const result = await this.clientPg.query(queryConfig);
            if (result.rows.length === 0) {
                throw new Error("data null");
            }
            return result.rows[0].id;
        }
        catch (error) {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuthService);
//# sourceMappingURL=auth.service.js.map
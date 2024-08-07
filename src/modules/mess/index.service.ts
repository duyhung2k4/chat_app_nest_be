import { AddMemberGroupChatReq, CreateBoxChatReq, CreateGroupChatReq } from "@/dto/request/mess";
import { BoxChatModel } from "@/models/box_chat";
import { PgService } from "@/shared/pg/index.service";
import { Injectable } from "@nestjs/common";
import { Client, QueryConfig } from "pg";
import { MessServiceInterface } from "./index.interface";
import { MessModel } from "@/models/mess";
import { Db, Filter, FindOptions } from "mongodb";
import { MongodbService } from "@/shared/mongodb/index.service";
import { COLLECTION } from "@/constants/collection";
import { GroupChatModel } from "@/models/group_chat";
import { ProfileGroupChatModel } from "@/models/profile_group_chat";
import { COLUMN_TABLE } from "@/constants/table";

@Injectable()
export class MessService implements MessServiceInterface {
    private initalized: Promise<void>
    private clientPg: Client
    private clientMongo: Db

    constructor(
        private readonly pgService: PgService,
        private readonly mongodbService: MongodbService
    ) {
        this.initalized = this.init();
    }

    private async init() {
        this.clientPg = await this.pgService.GetClientPg();
        this.clientMongo = await this.mongodbService.GetDatabase();
    }

    async CreateBoxChat(payload: CreateBoxChatReq): Promise<BoxChatModel> {
        try {
            const queryConfig: QueryConfig = {
                text: `
                    INSERT INTO box_chats (from_id, to_id) VALUES ($1, $2) RETURNING *
                `,
                values: [payload.profileId_1, payload.profileId_2]
            }
            
            const result = await this.clientPg.query<BoxChatModel>(queryConfig);
            if(result.rowCount === 0) {
                throw new Error("add data faild");
            }

            return result.rows[0];
        } catch (error) {
            return error;
        }
    }

    async CreateGroupChat(payload: CreateGroupChatReq): Promise<GroupChatModel> {
        try {
            await this.clientPg.query("BEGIN");

            const queryGroupChatConfig: QueryConfig = {
                text: `
                    INSERT INTO group_chats (create_id) VALUES ($1) RETURNING *
                `,
                values: [payload.createId]
            }
            const resultGroupChat = await this.clientPg.query<GroupChatModel>(queryGroupChatConfig);
            if(resultGroupChat.rowCount === 0) {
                throw new Error("insert error");
            }

            const queryProfileGroupChatConfig: QueryConfig = {
                text: `
                    INSERT INTO profile_group_chats 
                    (profile_id, group_chat_id) 
                    VALUES ($1, $2) 
                    RETURNING *
                `,
                values: [payload.createId, resultGroupChat.rows[0].id]
            }
            const resultProfileGroupChat = await this.clientPg.query<ProfileGroupChatModel>(queryProfileGroupChatConfig);
            if(resultProfileGroupChat.rowCount === 0) {
                throw new Error("insert error");
            }

            await this.clientPg.query("COMMIT");

            return resultGroupChat.rows[0];
        } catch (error) {
            return error;
        }
    }

    async AddMemberGroupChat(payload: AddMemberGroupChatReq): Promise<ProfileGroupChatModel> {
        try {
            const queryConfig: QueryConfig = {
                text: `
                    INSERT INTO profile_group_chats(profile_id, group_chat_id) VALUES ($1, $2) RETURNING *
                `,
                values: [payload.profileId, payload.groupChatId]
            }

            const result = await this.clientPg.query<ProfileGroupChatModel>(queryConfig);
            if(result.rowCount === 0) {
                throw new Error("insert error");
            }

            return result.rows[0];
        } catch (error) {
            return error;
        }
    }

    async InGroupChat(profileId: number, groupChatId: number): Promise<boolean> {
        try {
            const queryConfig: QueryConfig = {
                text:  `
                    SELECT * FROM profile_group_chats
                    WHERE profile_id = $1 AND group_chat_id = $2
                `,
                values: [profileId, groupChatId]
            }

            const result = await this.clientPg.query<ProfileGroupChatModel>(queryConfig);
            if(result.rowCount === 0) return false;

            return true;
        } catch (error) {
            return error;
        }
    }

    async GetBoxChat(profileId: number): Promise<BoxChatModel[]>{
        try {
            let listBoxChat: BoxChatModel[] = [];
            
            const queryConfig: QueryConfig = {
                text: `
                    SELECT
                        ${COLUMN_TABLE.box_chats.map(c => `b.${c} as b__${c}`).join(",")},
                        ${COLUMN_TABLE.profiles.map(c => `f.${c} as f__${c}`).join(",")},
                        ${COLUMN_TABLE.profiles.map(c => `t.${c} as t__${c}`).join(",")}
                    FROM box_chats as b 
                    JOIN profiles as f ON f.id = b.from_id
                    JOIN profiles as t ON t.id = b.to_id
                    WHERE from_id = $1 OR to_id = $1
                `,
                values: [profileId],
            }

            const result = await this.clientPg.query<BoxChatModel>(queryConfig);
            result.rows.forEach(item => {
                let boxChat = {
                    from_profile: {},
                    to_profile: {},
                }


                Object.keys(item).forEach(key => {
                    const [tagField, field] = key.split("__");
                    switch (tagField) {
                        case "b":
                            boxChat[field] = item[key];
                            break;
                        case "f":
                            boxChat.from_profile[field] = item[key];
                            break;
                        case "t":
                            boxChat.to_profile[field] = item[key];
                            break;
                        default:
                            break;
                    }
                });

                listBoxChat.push(boxChat as BoxChatModel);
            })
            return listBoxChat;
        } catch (error) {
            return error;
        }
    }

    async GetProfileGroupChat(profileId: number): Promise<ProfileGroupChatModel[]>{
        try {
            let profileGroupChats: ProfileGroupChatModel[] = [];
            
            const queryConfig: QueryConfig = {
                text: `
                    SELECT 
                        ${COLUMN_TABLE.profile_group_chats.map(c => `pg.${c} as pg__${c}`).join(",")},
                        ${COLUMN_TABLE.group_chats.map(c => `g.${c} as g__${c}`).join(",")}
                    FROM profile_group_chats as pg
                    JOIN group_chats as g ON g.id = pg.group_chat_id
                    WHERE pg.profile_id = $1 
                `,
                values: [profileId]
            }

            const result = await this.clientPg.query<Record<string, any>>(queryConfig);
            
            result.rows.forEach(item => {
                const profileGroupChat = {
                    group_chat: {}
                };

                Object.keys(item).forEach(key => {
                    const [tagField, field] = key.split("__");
                    switch (tagField) {
                        case "pg":
                            profileGroupChat[field] = item[key];
                            break;
                        case "g":
                            profileGroupChat.group_chat[field] = item[key];
                            break;
                        default:
                            break;
                    }
                })
                
                profileGroupChats.push(profileGroupChat as ProfileGroupChatModel);
            })
            
            return profileGroupChats;
        } catch (error) {
            return error;
        }
    }

    async LoadMess(id: number, type_mess: "box_chat" | "group_chat"): Promise<MessModel[]> {
        try {
            const listMess: MessModel[] = [];

            let filter: Filter<Document> = {};
            
            switch (type_mess) {
                case "box_chat":
                    filter.box_chat_id = id;
                    break;
                case "group_chat":
                    filter.group_chat_id = id;
                    break;
                default:
                    throw new Error("agrs error");
            }

            const result = this.clientMongo.collection(COLLECTION.MESS).find<MessModel>(filter);

            for await (const doc of result) {
                listMess.push(doc);
            }

            return listMess;
        } catch (error) {
            return error;
        }
    }

    async GetMemberGroupChat(id: number): Promise<ProfileGroupChatModel[]> {
        try {
            const queryConfig: QueryConfig = {
                text: `
                    SELECT * FROM
                    profile_group_chats
                    WHERE group_chat_id = $1
                `,
                values: [id]
            };

            const result = await this.clientPg.query<ProfileGroupChatModel>(queryConfig);
            return result.rows || [];
        } catch (error) {
            return error;
        }
    }
}
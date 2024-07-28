import { AddMemberGroupChatReq, CreateBoxChatReq, CreateGroupChatReq } from "@/dto/request/mess";
import { BoxChatModel } from "@/models/box_chat";
import { PgService } from "@/shared/pg/index.service";
import { Injectable } from "@nestjs/common";
import { Client, QueryConfig } from "pg";
import { MessServiceInterface } from "./index.interface";
import { MessModel } from "@/models/mess";
import { Db } from "mongodb";
import { MongodbService } from "@/shared/mongodb/index.service";
import { COLLECTION } from "@/constants/collection";
import { GroupChatModel } from "@/models/group_chat";
import { ProfileGroupChatModel } from "@/models/profile_group_chat";

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

    async LoadMess(boxChatId: number): Promise<MessModel[]> {
        try {
            const listMess: MessModel[] = [];
            const result = this.clientMongo.collection(COLLECTION.MESS).find<MessModel>({
                box_chat_id: boxChatId,
            })

            for await (const doc of result) {
                listMess.push(doc);
            }

            return listMess;
        } catch (error) {
            return error;
        }
    }
}
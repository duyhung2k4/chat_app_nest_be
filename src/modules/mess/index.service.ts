import { CreateBoxChatReq } from "@/dto/request/mess";
import { BoxChatModel } from "@/models/box_chat";
import { PgService } from "@/shared/pg/index.service";
import { Injectable } from "@nestjs/common";
import { Client, QueryConfig } from "pg";
import { MessServiceInterface } from "./index.interface";
import { MessModel } from "@/models/mess";
import { Db } from "mongodb";
import { MongodbService } from "@/shared/mongodb/index.service";
import { COLLECTION } from "@/constants/collection";

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
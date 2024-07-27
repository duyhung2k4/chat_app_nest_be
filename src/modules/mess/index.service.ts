import { CreateBoxChatReq } from "@/dto/request/mess";
import { BoxChatModel } from "@/models/box_chat";
import { PgService } from "@/shared/pg/index.service";
import { Injectable } from "@nestjs/common";
import { Client, QueryConfig } from "pg";

@Injectable()
export class MessService {
    private initalized: Promise<void>
    private clientPg: Client

    constructor(
        private readonly pgService: PgService
    ) {
        this.initalized = this.init();
    }

    private async init() {
        this.clientPg = await this.pgService.GetClientPg();
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
}
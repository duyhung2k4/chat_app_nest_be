import { ProfileModel } from "@/models/profile";
import { PgService } from "@/shared/pg/index.service";
import { Injectable } from "@nestjs/common";
import { Client, QueryConfig } from "pg";

@Injectable()
export class SearchService {
    private initialized: Promise<void>;
    private pgClient: Client;

    constructor(
        private readonly pgService: PgService
    ) {
        this.initialized = this.init();
    }

    private async init() {
        this.pgClient = await this.pgService.GetClientPg();
    }

    async SearchProfile(name: string, email: string): Promise<ProfileModel[]> {
        try {
            const queryConfig: QueryConfig = {
                text: 
                    `
                        SELECT * FROM profiles
                        WHERE 
                            ( CONCAT(first_name, ' ', last_name) ILIKE $1 OR email LIKE $2)
                    `,
                values: [`%${name}%`, `%${email}%`]
            }

            const result = await this.pgClient.query<ProfileModel>(queryConfig);
            if(result.rowCount === 0) {
                throw new Error("data null");
            }

            return result.rows;
        } catch (error) {
            return error;
        }
    }
}
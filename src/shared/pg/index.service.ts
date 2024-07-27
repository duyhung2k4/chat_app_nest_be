import { Injectable } from "@nestjs/common";
import { Client } from "pg";
import { PgInterface } from "./index.interface";

@Injectable()
export class PgService implements PgInterface {
    private initialized: Promise<void>
    private clientPg: Client;

    constructor() {
        this.clientPg = new Client({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT),
            host: process.env.DB_HOST,
        });

        this.initialized = this.connect();
    }

    private async connect(): Promise<void> {
        try {
            await this.clientPg.connect();
        } catch (error) {
            console.log(error);
        }
    }

    async GetClientPg(): Promise<Client> {
        await this.initialized;
        return this.clientPg;
    }
}
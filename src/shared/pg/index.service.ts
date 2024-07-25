import { Injectable } from "@nestjs/common";
import { createClient } from "@redis/client";
import { Client } from "pg";
import { RedisClientType } from "redis";
import { PgInterface } from "./index.interface";

@Injectable()
export class PgService implements PgInterface {
    private clientPg: Client;
    private clientRedis: RedisClientType;

    constructor() {
        this.clientPg = new Client({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT),
            host: process.env.DB_HOST,
        });
        this.clientRedis = createClient();

        this.connect();
    }

    private async connect(): Promise<void> {
        try {
            await this.clientPg.connect();
            await this.clientRedis.connect();
        } catch (error) {
            console.log(error);
        }
    }

    GetClientPg(): Client {
        return this.clientPg;
    }

    GetClientRedis(): RedisClientType {
        return this.clientRedis;
    }
}
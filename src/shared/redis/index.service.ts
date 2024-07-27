import { Injectable } from "@nestjs/common";
import { createClient } from "@redis/client";
import { RedisClientType } from "redis";
import { RedisInterface } from "./index.interface";

@Injectable()
export class RedisService implements RedisInterface {
    private initialized: Promise<void>
    private clientRedis: RedisClientType;

    constructor() {
        this.clientRedis = createClient();
        
        this.initialized = this.connect();
    }

    private async connect(): Promise<void> {
        try {
            await this.clientRedis.connect();
        } catch (error) {
            console.log(error);
        }
    }

    async GetClientRedis(): Promise<RedisClientType> {
        await this.initialized;
        return this.clientRedis;
    }
}
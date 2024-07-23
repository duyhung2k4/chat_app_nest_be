import { Client } from "pg";
import { createClient } from "redis";

export const clientPg = new Client({
    user: "postgres",
    password: "123456",
    database: "chat_app",
    port: 5432,
    host: "192.168.1.5",
});

export const clientRedis = createClient();
export type RedisClient = typeof clientRedis;

export const connectPg = async () => {
    try {
        await clientPg.connect();
    } catch (error) {
        console.log(error);
    }
}

export const connectRedis = async () => {
    try {
        await clientRedis.connect();
    } catch (error) {
        console.log(error);
    }
}
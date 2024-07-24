import { Client } from "pg";
import { createClient } from "redis";

console.log({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
})

export const clientPg = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
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
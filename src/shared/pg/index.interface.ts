import { Client } from "pg"
import { RedisClientType } from "redis"

export interface PgInterface {
    GetClientPg(): Client
    GetClientRedis(): RedisClientType
}
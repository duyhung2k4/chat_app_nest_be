import { RedisClientType } from "redis"

export interface RedisInterface {
    GetClientRedis(): Promise<RedisClientType>
}
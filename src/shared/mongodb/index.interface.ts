import { Db } from "mongodb";

export interface MongodbInterface {
    GetDatabase(): Promise<Db>
}
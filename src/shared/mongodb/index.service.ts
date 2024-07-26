import { Injectable } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";
import { MongodbInterface } from "./index.interface";
import { COLLECTION } from "@/constants/collection";

@Injectable()
export class MongodbService implements MongodbInterface {
    private client: MongoClient;
    private database: Db;

    constructor() {
        this.connect();
    }

    private async connect() {
        try {
            this.client = new MongoClient(process.env.MONGO_URI);
            await this.client.connect();
            
            this.database = this.client.db(process.env.MONGO_DB);
            await this.initCollecttion();
        } catch (error) {
            await this.client.close();
        }
    }

    private async initCollecttion() {
        try {
            await Promise.all(Object.keys(COLLECTION).map(key => {
                const promise = new Promise((resolve, reject) => {
                    this.database.createCollection(COLLECTION[key])
                        .then(data => resolve(data))
                        .catch(err => reject(err))
                });
    
                return promise;
            }));
        } catch (error) {
            console.log("error create collection mongodb: ", error);
        }
    }

    GetDatabase(): Db {
        return this.database;
    }
}
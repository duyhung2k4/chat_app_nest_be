import { Injectable } from "@nestjs/common";
import { RabbitMQInterface } from "./index.inteface";
import { Connection, connect as connectRabbitMQ, Channel, Replies, Message } from "amqplib/callback_api";
import { QUEUE } from "@/constants/queue";
import { MongodbService } from "../mongodb/index.service";
import { Db } from "mongodb";

@Injectable()
export class RabbitMQService implements RabbitMQInterface {
    private connection: Connection;
    private chanel: Channel;
    private queue: Replies.AssertQueue[];
    private initialized: Promise<void>;
    private mongodb: Db;

    constructor(
        private readonly mongodbService: MongodbService
    ) {
        this.initialized = this.init();
    }
    
    private async init(): Promise<void> {
        try {
            await this.createConnect();
            await this.createChanel();
            await this.assertQueue();

            this.mongodb = await this.mongodbService.GetDatabase();
            
            this.consumerMess();
        } catch (error) {
            console.log(error);
        }
    }

    private async createConnect(): Promise<void> {
        try {
            const promise = new Promise<Connection>((resolve, reject) => {
                connectRabbitMQ(process.env.URL_RABBIT_MQ, (err, connection) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(connection);
                });
            });

            this.connection = await promise;
        } catch (error) {
            console.log("rabbitmq connect: ", error);
        }
    }

    private async createChanel(): Promise<void> {
        try {
            const promise = new Promise<Channel>((resolve, reject) => {
                this.connection.createChannel((err, chanel) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(chanel);
                });
            });

            this.chanel = await promise;
        } catch (error) {
            console.log("create channel: ", error);
        }
    }

    private async assertQueue(): Promise<void> {
        try {
            const listPromise = Object.keys(QUEUE).map(key => {
                const promise = new Promise<Replies.AssertQueue>((resolve, reject) => {
                    this.chanel.assertQueue(QUEUE[key], {
                        durable: true,
                    }, (err, ok) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(ok);
                    });
                });

                return promise;
            });

            this.queue = await Promise.all(listPromise);
        } catch (error) {
            console.log(error);
        }
    }

    private consumerMess() {
        this.chanel.consume(QUEUE.mess, async (msg: Message) => {
            try {
                const document = JSON.parse(msg.content.toString());
                await this.mongodb.collection(QUEUE.mess).insertOne(document, {});
                this.chanel.ack(msg);
            } catch (error) {
                console.log(error);
            }
        })
    }

    async GetQueue(): Promise<Replies.AssertQueue[]> {
        await this.initialized;
        return this.queue;
    }

    async GetChanel(): Promise<Channel> {
        await this.initialized;
        return this.chanel;
    }
}
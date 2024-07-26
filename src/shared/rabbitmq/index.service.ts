import { Injectable } from "@nestjs/common";
import { RabbitMQInterface } from "./index.inteface";
import { Connection, connect as connectRabbitMQ, Channel, Replies } from "amqplib/callback_api";
import { QUEUE, QUEUE_TYPE } from "@/constants/queue";

@Injectable()
export class RabbitMQService implements RabbitMQInterface {
    private connection: Connection;
    private chanel: Channel;
    private queue: Replies.AssertQueue[];
    private initialized: Promise<ResultInit>;

    constructor() {
        this.initialized = this.init();
    }

    private async init(): Promise<ResultInit> {
        try {
            const connection = await this.createConnect();
            const chanel = await this.createChanel();
            const queue = await this.assertQueue();

            return {
                connection,
                chanel,
                queue,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    private async createConnect(): Promise<Connection> {
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

            const result = await promise;
            this.connection = result;
            return result;
        } catch (error) {
            console.log("rabbitmq connect: ", error);
            throw error;
        }
    }

    private async createChanel(): Promise<Channel> {
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

            const result = await promise;
            this.chanel = result;
            return result;
        } catch (error) {
            console.log("create channel: ", error);
            throw error;
        }
    }

    private async assertQueue(): Promise<Replies.AssertQueue[]> {
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

            const result = await Promise.all(listPromise);
            this.queue = result;
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async GetChanel(): Promise<Channel> {
        await this.initialized;
        return this.chanel;
    }
}

type ResultInit = {
    connection: Connection;
    chanel: Channel;
    queue: Replies.AssertQueue[];
}

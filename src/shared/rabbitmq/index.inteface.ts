import { Channel, Replies } from "amqplib/callback_api";

export interface RabbitMQInterface {
    GetChanel(): Promise<Channel>
    GetQueue(): Promise<Replies.AssertQueue[]>
}
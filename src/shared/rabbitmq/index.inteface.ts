import { Channel } from "amqplib/callback_api";

export interface RabbitMQInterface {
    GetChanel(): Promise<Channel>
}
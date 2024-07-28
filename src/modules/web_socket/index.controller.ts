import * as dayjs from "dayjs";

import { Controller } from "@nestjs/common";
import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { WebSocketInterface } from "./index.interface";
import { RabbitMQService } from "@/shared/rabbitmq/index.service";
import { Channel } from "amqplib/callback_api";
import { QUEUE } from "@/constants/queue";
import { FIELD_SOCKET } from "@/constants/websocket";
import { MESS_FIELD_REQUIRE, MessModel } from "@/models/mess";

@Controller()
export class WebSocketController implements WebSocketInterface {
    private wss: WebSocketServer;
    private mapWs: Map<string, WebSocket>;
    private userClientWsConnection: Map<string, { count: number, connections: WebSocket[] }>;
    private chanelRabbitMQ: Channel;

    constructor(
        private readonly rabbitMQService: RabbitMQService
    ) {
        this.wss = new WebSocketServer({ port: 8080 });
        this.mapWs = new Map();
        this.userClientWsConnection = new Map();

        this.getServicePromise();
        this.HandleConnect();
    }

    private async getServicePromise() {
        this.chanelRabbitMQ = await this.rabbitMQService.GetChanel();
    }

    private checkPayload(mess: MessModel): boolean {
        MESS_FIELD_REQUIRE.forEach(item => {
            if(mess[item] === undefined) return false;
        })
        return true;
    }

    HandleConnect() {
        try {
            this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
                const key_ws = this.SetIdClient(ws, req);

                this.OnMess(ws);
                this.HandleError(ws);
                this.HandleDisconnect(ws, key_ws);
            })
        } catch (error) {
            console.log(error);
        }
    }

    HandleError(ws: WebSocket) {
        ws.on("error", (err) => {
            console.log(err);
        });
    }

    SetIdClient(ws: WebSocket, req: IncomingMessage): string | null {
        try {
            let mapParams = {};
            let profileId = "";
            let key_ws = "";

            req.url.split("?")[1].split("&").forEach(item => {
                const [key, value] = item.split("=");
                mapParams[key] = value;
            });

            if (mapParams["id"]) {
                profileId = mapParams["id"];
                const uuid = uuidv4();
                key_ws = `${uuid}_${profileId}`;
                
                ws[FIELD_SOCKET.id] = profileId;
                ws[FIELD_SOCKET.key_ws] = key_ws;
                this.mapWs.set(key_ws, ws);
                this.SetCountUserClient(profileId, "up", ws);
            }

            return key_ws;
        } catch (error) {
            return null;
        }
    }

    HandleDisconnect(ws: WebSocket, key_ws: string) {
        ws.on("close", () => {
            if (!key_ws || key_ws.split("_").length < 2) return;

            const profileId = key_ws.split("_")[1];

            this.mapWs.delete(key_ws);
            this.SetCountUserClient(profileId, "down", ws);
        });
    }

    SetCountUserClient(profileId: string, type: "up" | "down", ws: WebSocket) {
        if (!this.userClientWsConnection.get(profileId)) {
            this.userClientWsConnection.set(profileId, { count: 0, connections: [] });
        }

        const curUserClientConnection = this.userClientWsConnection.get(profileId);

        switch (type) {
            case "up":
                this.userClientWsConnection.set(profileId, {
                    count: curUserClientConnection.count + 1,
                    connections: [...curUserClientConnection.connections, ws],
                });
                break;
            case "down":
                this.userClientWsConnection.set(profileId, {
                    count: curUserClientConnection.count - 1,
                    connections: curUserClientConnection.connections.filter(item => item[FIELD_SOCKET.key_ws] !== ws[FIELD_SOCKET.key_ws]),
                });
                break;
            default:
                break;
        }
    }

    OnMess(ws: WebSocket) {
        ws.on("message", (data) => {
            try {                
                const mess: MessModel = JSON.parse(data.toString());
    
                if(!this.checkPayload(mess) || ( !mess.box_chat_id && !mess.group_chat_id )) {
                    ws.send(JSON.stringify({
                        error: new Error("wrong format")
                    }))
                    return;
                }
    
    
                const insertMess: MessModel = {
                    ...mess,
                    from_id: Number(ws[FIELD_SOCKET.id]),
                    uuid: uuidv4().toString(),
                    created_at: dayjs().toDate(),
                    updated_at: null,
                    deleted_at: null,
                }
    
                const repData = JSON.stringify(insertMess);
                ws.send(repData);
                this.userClientWsConnection.get(`${insertMess.to_id}`).connections.forEach(item => {
                    item.send(repData);
                })
    
                this.chanelRabbitMQ.sendToQueue(QUEUE.mess, Buffer.from(JSON.stringify(insertMess)), {
                    persistent: true,
                });
            } catch (error) {
                ws.send(JSON.stringify(error));
            }
        })
    }
}
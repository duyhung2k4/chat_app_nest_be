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
import { JwtService } from "@/shared/jwt/index.service";
import { TOKEN_TYPE } from "@/constants/token";
import { TYPE_MESS } from "@/constants/mess";
import { MessService } from "../mess/index.service";
import { ProfileGroupChatModel } from "@/models/profile_group_chat";
import { TokenInfoResult } from "@/shared/jwt/index.interface";

@Controller()
export class WebSocketController implements WebSocketInterface {
    private initialized: Promise<void>
    private wss: WebSocketServer;
    private mapWs: Map<string, WebSocket>;
    private mapWsGroupChat: Map<number, WebSocket[]>;
    private userClientWsConnection: Map<string, { count: number, connections: WebSocket[] }>;
    private chanelRabbitMQ: Channel;

    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly jwtService: JwtService,
        private readonly messService: MessService,
    ) {
        this.wss = new WebSocketServer({ port: 8080 });
        this.mapWs = new Map();
        this.mapWsGroupChat = new Map();
        this.userClientWsConnection = new Map();

        this.getServicePromise();
        this.initialized = this.init();
    }

    private async getServicePromise() {
        this.chanelRabbitMQ = await this.rabbitMQService.GetChanel();
    }

    private checkPayload(mess: MessModel): boolean {
        MESS_FIELD_REQUIRE.forEach(item => {
            if (mess[item] === undefined) return false;
        })
        return true;
    }

    private async getTokenResult( ws: WebSocket, req: IncomingMessage): Promise<TokenInfoResult | null> {
        try {            
            if (!req.headers.cookie) {
                ws.close();
                throw null;
            }
            const mapToken = this.jwtService.MapCookie(req.headers.cookie);
            const tokenInfoResult = await this.jwtService.VerifyToken(mapToken[TOKEN_TYPE.ACCESS_TOKEN]);
            if (!tokenInfoResult.profile_id) {
                ws.close();
                throw null;
            }
            return tokenInfoResult;
        } catch (error) {
            return error;
        }
    }

    private async init(): Promise<void> {
        try {
            this.wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
                const tokenInfoResult = await this.getTokenResult(ws, req);
                if(!tokenInfoResult) {
                    ws.close();
                    return;
                }
                const key_ws = this.SetIdClient(ws, tokenInfoResult.profile_id);
                
                await this.SetGroupChat(ws, tokenInfoResult);

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
    
    async SetGroupChat(ws: WebSocket, tokenInfoResult: TokenInfoResult): Promise<void> {
        try {
            // Tìm các group_chat_ws join
            // loop qua group_chat_ws: 
            //      - mapWsGroupChat chưa có group_chat_id thì thêm vào
            //      - có rồi thì push thêm ws vào
            const listGroupChat = await this.messService.GetProfileGroupChat(tokenInfoResult.profile_id);
            ws[FIELD_SOCKET.list_group_chat_id] = listGroupChat;
            listGroupChat.forEach(item => {
                const groupChat = this.mapWsGroupChat.get(item.group_chat_id);
                if (!groupChat) {
                    this.mapWsGroupChat.set(item.group_chat_id, [ws]);
                } else {
                    this.mapWsGroupChat.set(item.group_chat_id, [ws, ...groupChat]);
                }
            });
        } catch (error) {
            return error;
        }
    }

    SetIdClient(ws: WebSocket, profileId: number): string | null {
        try {
            let key_ws = "";
            const uuid = uuidv4();
            key_ws = `${uuid}_${profileId}`;
            
            ws[FIELD_SOCKET.id] = profileId;
            ws[FIELD_SOCKET.key_ws] = key_ws;
            this.mapWs.set(key_ws, ws);
            this.SetCountUserClient(`${profileId}`, "up", ws);

            return key_ws;
        } catch (error) {
            return null;
        }
    }

    HandleDisconnect(ws: WebSocket, key_ws: string) {
        ws.on("close", () => {
            if (!key_ws || key_ws.split("_").length < 2) return;

            const profileId = key_ws.split("_")[1];

            (ws[FIELD_SOCKET.list_group_chat_id] as ProfileGroupChatModel[] ).forEach(item => {
                const curGroup = this.mapWsGroupChat.get(item.group_chat_id);
                this.mapWsGroupChat.set(item.group_chat_id, curGroup.filter(g => g[FIELD_SOCKET.key_ws] !== ws[FIELD_SOCKET.key_ws]));
            })

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

                if (
                    !this.checkPayload(mess) || 
                    (!mess.box_chat_id && !mess.group_chat_id) ||
                    (mess.box_chat_id && mess.group_chat_id)
                ) {
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

                let typeMess: TYPE_MESS = "box_chat";
                if (insertMess.group_chat_id) {
                    typeMess = "group_chat";
                }

                switch (typeMess) {
                    case "box_chat":
                        ws.send(repData);
                        
                        const toClient = this.userClientWsConnection.get(`${insertMess.to_id}`);
                        if(toClient) {
                            toClient.connections.forEach(item => {
                                item.send(repData);
                            })
                        }
                        break;
                    case "group_chat":
                        //  - lấy mapWsGroupChat.get(insertMess.group_chat_id)
                        //  - loop qua rồi gửi tin nhắn
                        const listWS = this.mapWsGroupChat.get(insertMess.group_chat_id);
                        if(listWS) {
                            listWS.forEach(item => {
                                item.send(repData);
                            });
                        }
                        break;
                    default:
                        break;
                }

                this.chanelRabbitMQ.sendToQueue(QUEUE.mess, Buffer.from(JSON.stringify(insertMess)), {
                    persistent: true,
                });
            } catch (error) {
                ws.send(JSON.stringify(error));
            }
        })
    }
}
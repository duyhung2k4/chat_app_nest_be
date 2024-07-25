import { Controller } from "@nestjs/common";
import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { WebSocketInterface } from "./index.interface";

@Controller()
export class WebSocketController implements WebSocketInterface {
    private wss: WebSocketServer;
    private mapWs: Map<string, WebSocket>;
    private userClientWsCount: Map<string, number>;

    constructor() {
        this.wss = new WebSocketServer({ port: 8080 });
        this.mapWs = new Map();
        this.userClientWsCount = new Map();

        this.HandleConnect();
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

                this.mapWs.set(key_ws, ws);
                this.SetCountUserClient(profileId, "up");
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
            this.SetCountUserClient(profileId, "down");
        });
    }

    SetCountUserClient(profileId: string, type: "up" | "down") {
        if (!this.userClientWsCount.get(profileId)) {
            this.userClientWsCount.set(profileId, 0);
        }

        const curUserClientCount = this.userClientWsCount.get(profileId);

        switch (type) {
            case "up":
                this.userClientWsCount.set(profileId, curUserClientCount + 1);
                break;
            case "down":
                this.userClientWsCount.set(profileId, curUserClientCount - 1);
                break;
            default:
                break;
        }
    }

    OnMess(ws: WebSocket) {
        ws.on("message", (data) => {
            this.SendAllServer(data.toString());
        })
    }

    SendAllServer(data: string) {
        this.mapWs.forEach((ws, _) => {
            ws.send(data);
        });
    }
}
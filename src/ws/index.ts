import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
class ServerSocket {
    private wss: WebSocketServer;
    private mapWs: Map<string, WebSocket>;
    private userClientWsCount: Map<string, number>;

    constructor() {
        this.wss = new WebSocketServer({ port: Number(8080) });
        this.mapWs = new Map();
        this.userClientWsCount = new Map();
    }

    Init() {
        this.handleConnect();
    }



    // Root connect
    private handleConnect() {
        this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
            const key_ws = this.setIdClient(ws, req);

            this.onMess(ws);
            this.handleError(ws);
            this.handleDisconnect(ws, key_ws);
        })
    }



    // Handle Error
    private handleError(ws: WebSocket) {
        ws.on("error", (err) => {
            console.log(err);
        });
    }



    // Handle connect
    private setIdClient(ws: WebSocket, req: IncomingMessage): string {
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
            this.setCountUserClient(profileId, "up");
        }

        return key_ws;
    }

    private handleDisconnect(ws: WebSocket, key_ws: string) {
        ws.on("close", () => {
            const profileId = key_ws.split("_")[1];

            this.mapWs.delete(key_ws);
            this.setCountUserClient(profileId, "down");
        });
    }

    private setCountUserClient(profileId: string, type: "up" | "down") {
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



    // Handle message
    private async onMess(ws: WebSocket) {
        ws.on("message", (data) => {
            this.sendAllServer(data.toString());
        })
    }

    private async sendAllServer(data: string) {
        this.mapWs.forEach((ws, _) => {
            ws.send(data);
        });
    }
}

export const serverSocket = new ServerSocket();

export default ServerSocket;
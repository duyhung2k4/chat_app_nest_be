import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
class ServerSocket {
    private wss: WebSocketServer;
    private mapWs: Map<string, WebSocket>;

    constructor () {
        this.wss = new WebSocketServer({ port: Number(8080) });
        this.mapWs = new Map();
    }
    
    Init() {
        this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
            let mapParams = {};
            req.url.split("?")[1].split("&").forEach(item => {
                const [key, value] = item.split("=");
                mapParams[key] = value;
            });
            let profileId = "";
            if(mapParams["id"]) {
                profileId = mapParams["id"];
                const uuid = uuidv4();
                const key_ws = `${uuid}_${profileId}`;
                this.mapWs.set(key_ws, ws);
            }

            ws.on("message", (data) => {
                const { mess } = JSON.parse(data.toString());
                const dataRep = JSON.stringify({
                    rep: mess,
                });

                this.sendAllServer(dataRep);
            })

            ws.on("error", (err) => {
                console.log(err);
            });
            ws.on("close", () => {
                this.mapWs.delete(profileId);
            });
        });
    }

    private async sendAllServer(data: string) {
        this.mapWs.forEach((ws, _) => {
            ws.send(data);
        });
    }
}

export const serverSocket = new ServerSocket();

export default ServerSocket;
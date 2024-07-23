import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

class ServerSocket {
    private wss: WebSocketServer;
    
    Init() {
        this.wss = new WebSocketServer({ port: Number(8080) });
        this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
            ws.on("error", (err) => {
                console.log(err);
            });
            ws.on("close", () => {
                console.log(req.headers);
            });
        });
    }
}

export const serverSocket = new ServerSocket();

export default ServerSocket;
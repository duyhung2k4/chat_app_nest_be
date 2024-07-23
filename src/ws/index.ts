import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";

class ServerSocket {
    private wss: WebSocketServer;
    
    Init() {
        this.wss = new WebSocketServer({ port: Number(8080) });
        this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
            let mapParams = {};
            req.url.split("?")[1].split("&").forEach(item => {
                const [key, value] = item.split("=");
                mapParams[key] = value;
            });

            ws.on("message", (data) => {
                const { mess } = JSON.parse(data.toString());
                ws.send(JSON.stringify({
                    rep: mess,
                }))
            })

            ws.on("error", (err) => {
                console.log(err);
            });
            ws.on("close", () => {
                // console.log(req.headers.connection);
            });
        });
    }
}

export const serverSocket = new ServerSocket();

export default ServerSocket;
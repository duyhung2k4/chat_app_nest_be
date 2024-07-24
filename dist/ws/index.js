"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverSocket = void 0;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
class ServerSocket {
    constructor() {
        this.wss = new ws_1.WebSocketServer({ port: Number(8080) });
        this.mapWs = new Map();
        this.userClientWsCount = new Map();
    }
    Init() {
        this.handleConnect();
    }
    handleConnect() {
        this.wss.on("connection", (ws, req) => {
            const key_ws = this.setIdClient(ws, req);
            this.onMess(ws);
            this.handleError(ws);
            this.handleDisconnect(ws, key_ws);
        });
    }
    handleError(ws) {
        ws.on("error", (err) => {
            console.log(err);
        });
    }
    setIdClient(ws, req) {
        let mapParams = {};
        let profileId = "";
        let key_ws = "";
        req.url.split("?")[1].split("&").forEach(item => {
            const [key, value] = item.split("=");
            mapParams[key] = value;
        });
        if (mapParams["id"]) {
            profileId = mapParams["id"];
            const uuid = (0, uuid_1.v4)();
            key_ws = `${uuid}_${profileId}`;
            this.mapWs.set(key_ws, ws);
            this.setCountUserClient(profileId, "up");
        }
        return key_ws;
    }
    handleDisconnect(ws, key_ws) {
        ws.on("close", () => {
            const profileId = key_ws.split("_")[1];
            this.mapWs.delete(key_ws);
            this.setCountUserClient(profileId, "down");
        });
    }
    setCountUserClient(profileId, type) {
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
    async onMess(ws) {
        ws.on("message", (data) => {
            this.sendAllServer(data.toString());
        });
    }
    async sendAllServer(data) {
        this.mapWs.forEach((ws, _) => {
            ws.send(data);
        });
    }
}
exports.serverSocket = new ServerSocket();
exports.default = ServerSocket;
//# sourceMappingURL=index.js.map
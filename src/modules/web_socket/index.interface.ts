import { IncomingMessage } from "http";
import { WebSocket } from "ws";

export interface WebSocketInterface {
    // Handle connect
    HandleConnect(): void
    SetIdClient(ws: WebSocket, req: IncomingMessage): string | null
    HandleDisconnect(ws: WebSocket, key_ws: string): void
    SetCountUserClient(profileId: string, type: "up" | "down"): void

    // Handle message
    OnMess(ws: WebSocket): void
    
    // Handle Error
    HandleError(ws: WebSocket): void
}
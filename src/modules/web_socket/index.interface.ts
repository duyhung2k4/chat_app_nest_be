import { TYPE_MESS } from "@/constants/mess";
import { TokenInfoResult } from "@/shared/jwt/index.interface";
import { IncomingMessage } from "http";
import { WebSocket } from "ws";

export interface WebSocketInterface {
    // Handle connect
    SetGroupChat(ws: WebSocket, tokenInfoResult: TokenInfoResult): Promise<void>
    SetIdClient(ws: WebSocket, profile_id: number): string | null
    HandleDisconnect(ws: WebSocket, key_ws: string): void
    SetCountUserClient(profileId: number, type: "up" | "down", ws: WebSocket): void

    // Handle message
    OnMess(ws: WebSocket): void
    
    // Handle Error
    HandleError(ws: WebSocket): void
}

export type TypeOnMess = {
    type: TYPE_MESS
    data: any
}
declare class ServerSocket {
    private wss;
    private mapWs;
    private userClientWsCount;
    constructor();
    Init(): void;
    private handleConnect;
    private handleError;
    private setIdClient;
    private handleDisconnect;
    private setCountUserClient;
    private onMess;
    private sendAllServer;
}
export declare const serverSocket: ServerSocket;
export default ServerSocket;

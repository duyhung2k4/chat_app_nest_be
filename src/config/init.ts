import testEvent from "@/events/test";
import { connectPg, connectRedis } from "./connect"
import { serverSocket } from "@/ws";

export const init = async () => {
    await connectPg();
    await connectRedis();

    testEvent.Init();
    serverSocket.Init();
}
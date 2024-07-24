"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const test_1 = require("../events/test");
const connect_1 = require("./connect");
const ws_1 = require("../ws");
const init = async () => {
    await (0, connect_1.connectPg)();
    await (0, connect_1.connectRedis)();
    test_1.default.Init();
    ws_1.serverSocket.Init();
};
exports.init = init;
//# sourceMappingURL=init.js.map
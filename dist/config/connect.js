"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.connectPg = exports.clientRedis = exports.clientPg = void 0;
const pg_1 = require("pg");
const redis_1 = require("redis");
exports.clientPg = new pg_1.Client({
    user: "postgres",
    password: "123456",
    database: "chat_app",
    port: 5432,
    host: "192.168.1.5",
});
exports.clientRedis = (0, redis_1.createClient)();
const connectPg = async () => {
    try {
        await exports.clientPg.connect();
    }
    catch (error) {
        console.log(error);
    }
};
exports.connectPg = connectPg;
const connectRedis = async () => {
    try {
        await exports.clientRedis.connect();
    }
    catch (error) {
        console.log(error);
    }
};
exports.connectRedis = connectRedis;
//# sourceMappingURL=connect.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.connectPg = exports.clientRedis = exports.clientPg = void 0;
const pg_1 = require("pg");
const redis_1 = require("redis");
console.log({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
});
exports.clientPg = new pg_1.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST,
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
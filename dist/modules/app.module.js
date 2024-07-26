"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const index_module_1 = require("./auth/index.module");
const morgan_middleware_1 = require("../middlewares/morgan.middleware");
const index_module_2 = require("./web_socket/index.module");
const index_module_3 = require("../shared/pg/index.module");
const index_module_4 = require("../shared/mongodb/index.module");
const index_module_5 = require("../shared/rabbitmq/index.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(morgan_middleware_1.MorganMiddleware).forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            index_module_1.AuthModule,
            index_module_2.WebSocketModule,
            index_module_3.PgModule,
            index_module_4.MongodbModule,
            index_module_5.RabbitMQModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
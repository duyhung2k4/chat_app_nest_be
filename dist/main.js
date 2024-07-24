"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
const init_1 = require("./config/init");
async function main() {
    await (0, init_1.init)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    await app.listen(10000);
}
main();
//# sourceMappingURL=main.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const test_1 = require("../events/test");
const init = async () => {
    try {
        test_1.default.Init();
    }
    catch (error) {
        console.log(error);
    }
};
exports.init = init;
//# sourceMappingURL=init.js.map
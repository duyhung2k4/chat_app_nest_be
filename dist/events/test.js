"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_events_1 = require("node:events");
class TestEvent {
    constructor() {
        this.eventEmitter = new node_events_1.EventEmitter();
    }
    Init() {
        this.eventEmitter.on("test_1", this.test1);
    }
    GetEvent() {
        return this.eventEmitter;
    }
    test1(payload) {
        console.log(payload);
    }
}
const testEvent = new TestEvent();
exports.default = testEvent;
//# sourceMappingURL=test.js.map
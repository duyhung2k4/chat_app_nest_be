import { EventEmitter } from "node:events";
declare class TestEvent {
    private eventEmitter;
    constructor();
    Init(): void;
    GetEvent(): EventEmitter;
    private test1;
}
declare const testEvent: TestEvent;
export default testEvent;

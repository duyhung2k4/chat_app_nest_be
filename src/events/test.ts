import { EventEmitter } from "node:events";

class TestEvent {
    private eventEmitter: EventEmitter;

    constructor () {
        this.eventEmitter = new EventEmitter();
    }

    Init() {
        this.eventEmitter.on("test_1", this.test1);
    }

    GetEvent(): EventEmitter {
        return this.eventEmitter;
    }

    private test1(payload: any) {
        console.log(payload);
    }
}

const testEvent = new TestEvent();
export default testEvent;
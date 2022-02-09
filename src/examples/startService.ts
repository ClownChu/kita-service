import { RawData, WebSocket } from 'ws';
import KitaService from '../service';

class SampleService extends KitaService {
    constructor() {
        super(`Sample Service`);
    }

    beforeStart(): void {
        console.log(`[${this.Name}] Starting`);
    }

    afterStart(): void {
        console.log(`[${this.Name}] Started`);
    }


    beforeExit(): void {
        console.log(`[${this.Name}] Exiting`);
    }

    afterExit(): void {
        console.log(`[${this.Name}] Exited`);
    }

    onConnection(connection: WebSocket): void {
        console.log(`[${this.Name}] readyState = ${connection.readyState}`);
    }

    onMessage(connection: WebSocket, msg: RawData): void {
        console.log(`[${this.Name}] readyState = ${connection.readyState}`);
        console.log(`[${this.Name}] msg = ${msg.toString()}`);
    }

    onClose(connection: WebSocket): void {
        console.log(`[${this.Name}] readyState = ${connection.readyState}`);
    }
}

/**
 * node startService.js
 */

const service = new SampleService();
service.start();
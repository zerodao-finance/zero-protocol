/// <reference types="node" />
import { ConnectionTypes } from "./types";
import { EventEmitter } from "events";
declare class P2PClient extends EventEmitter {
    conn: ConnectionTypes;
    keepers: string[];
    log: Console;
    _pending: Object;
    constructor(options: {
        conn: ConnectionTypes;
    });
    subscribeKeepers(): Promise<void>;
    unsubscribeKeepers(): Promise<void>;
    handleConnections(): void;
    publishRequest(request: any, requestTemplate?: any, requestType?: string): Promise<EventEmitter>;
    publishBurnRequest(burnReqeust: any): Promise<EventEmitter>;
    publishMetaRequest(metaRequest: any): Promise<EventEmitter>;
    publishTransferRequest(transferRequest: any): Promise<EventEmitter>;
}
export declare class ZeroUser extends P2PClient {
    constructor(options: {
        conn: ConnectionTypes;
    });
    subscribeKeepers(): Promise<void>;
    unsubscribeKeepers(): Promise<void>;
    handleConnection(callback: Function): any;
    publishRequest(request: any, requestTemplate?: string[], requestType?: string): Promise<EventEmitter>;
    publishBurnRequest(burnRequest: any): Promise<EventEmitter>;
    publishMetaRequest(metaRequest: any): Promise<EventEmitter>;
    publishTransferRequest(transferRequest: any): Promise<EventEmitter>;
}
export {};

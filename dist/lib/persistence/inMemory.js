"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPersistenceAdapter = void 0;
const object_hash_1 = __importDefault(require("object-hash"));
class InMemoryPersistenceAdapter {
    constructor() {
        this.backend = new Map();
    }
    async set(transferRequest) {
        const tr = Object.assign({}, transferRequest);
        delete tr._mint;
        delete tr._queryTxResult;
        const key = (0, object_hash_1.default)(tr);
        const status = Object.assign(Object.assign({}, tr), { status: 'pending' });
        try {
            await this.backend.set(key, status);
            return key;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async get(key) {
        try {
            const value = this.backend.get(key);
            if (value) {
                return value;
            }
            else
                return undefined;
        }
        catch (e) {
            return undefined;
        }
    }
    async remove(key) {
        try {
            await this.backend.delete(key);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async has(key) {
        try {
            return await this.backend.has(key);
        }
        catch (e) {
            return false;
        }
    }
    async getStatus(key) {
        try {
            const value = (await this.get(key));
            if (value) {
                return value.status;
            }
            else {
                throw new Error(`No transfer request with key: ${key}`);
            }
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async setStatus(key, status) {
        try {
            const value = (await this.get(key));
            if (value) {
                value.status = status;
                await this.backend.set(key, value);
            }
            else
                throw new Error(`No transfer request with key: ${key}`);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getAllTransferRequests() {
        return Array.from(this.backend.values());
    }
}
exports.InMemoryPersistenceAdapter = InMemoryPersistenceAdapter;
//# sourceMappingURL=inMemory.js.map
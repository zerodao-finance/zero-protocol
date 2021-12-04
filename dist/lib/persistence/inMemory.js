"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    set(transferRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const tr = Object.assign({}, transferRequest);
            delete tr._mint;
            delete tr._queryTxResult;
            const key = (0, object_hash_1.default)(tr);
            const status = Object.assign(Object.assign({}, tr), { status: 'pending' });
            try {
                yield this.backend.set(key, status);
                return key;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.backend.delete(key);
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
    has(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.backend.has(key);
            }
            catch (e) {
                return false;
            }
        });
    }
    getStatus(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const value = (yield this.get(key));
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
        });
    }
    setStatus(key, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const value = (yield this.get(key));
                if (value) {
                    value.status = status;
                    yield this.backend.set(key, value);
                }
                else
                    throw new Error(`No transfer request with key: ${key}`);
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    getAllTransferRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.backend.values());
        });
    }
}
exports.InMemoryPersistenceAdapter = InMemoryPersistenceAdapter;

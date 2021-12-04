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
exports.LocalStoragePersistenceAdapter = void 0;
const object_hash_1 = __importDefault(require("object-hash"));
class LocalStoragePersistenceAdapter {
    constructor() {
        this.backend = window.localStorage;
    }
    set(transferRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = (0, object_hash_1.default)(transferRequest);
            const status = Object.assign(Object.assign({}, transferRequest), { status: 'pending' });
            const serialized = JSON.stringify(status);
            try {
                yield this.backend.setItem(`request:${key}`, serialized);
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
                const value = yield this.backend.getItem(`request:${key}`);
                if (value) {
                    const parsed = JSON.parse(value);
                    return parsed;
                }
                else
                    throw new Error('Could not find transferRequest');
            }
            catch (e) {
                return undefined;
            }
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.backend.removeItem(`request:${key}`);
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
                const value = yield this.get(key);
                if (value)
                    return true;
                return false;
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
                return value === null || value === void 0 ? void 0 : value.status;
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
                    this.backend.setItem(key, JSON.stringify(value));
                }
                throw new Error(`No transfer request with key: ${key}`);
            }
            catch (e) { }
        });
    }
    getAllTransferRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = Object.keys(this.backend).filter((v) => v.startsWith('request:'));
            const returnArr = [];
            for (const key of keys) {
                returnArr.push((yield this.get(key)));
            }
            return returnArr;
        });
    }
}
exports.LocalStoragePersistenceAdapter = LocalStoragePersistenceAdapter;

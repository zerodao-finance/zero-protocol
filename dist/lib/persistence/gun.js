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
exports.GunPersistenceAdapter = void 0;
const gun_1 = __importDefault(require("gun"));
const object_hash_1 = __importDefault(require("object-hash"));
class GunPersistenceAdapter {
    constructor(address) {
        this.address = address;
        this.backend = new gun_1.default(['http://localhost:8765/gun']);
    }
    set(transferRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = (0, object_hash_1.default)(transferRequest);
            const status = Object.assign(Object.assign({}, transferRequest), { status: 'pending' });
            try {
                yield this.backend
                    .get('transferRequests')
                    .get(this.address)
                    .set(Object.assign(Object.assign({}, status), { key }));
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
                const values = yield this.getAllTransferRequests();
                const value = values.filter((data) => (data === null || data === void 0 ? void 0 : data.key) === key)[0];
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
                let deleted = false;
                yield this.backend
                    .get('transferRequests')
                    .get(this.address)
                    .map()
                    // @ts-expect-error
                    .val(function (val, field) {
                    if ((val === null || val === void 0 ? void 0 : val.key) === key && !deleted) {
                        this.back(1).put({ [field]: null });
                        deleted = true;
                    }
                });
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
                const value = (yield this.get(key));
                if (value) {
                    return true;
                }
                else
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
                    yield this.backend.get('transferRequest').get(this.address).set(value);
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
            let values = [];
            yield this.backend
                .get('transferRequests')
                .map()
                .once((d) => {
                if (d) {
                    values.push(d);
                }
            });
            return values;
        });
    }
}
exports.GunPersistenceAdapter = GunPersistenceAdapter;

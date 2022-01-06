var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import Gun from 'gun';
import hash from 'object-hash';
var GunPersistenceAdapter = /** @class */ (function () {
    function GunPersistenceAdapter(address) {
        this.address = address;
        this.backend = new Gun(['http://localhost:8765/gun']);
    }
    GunPersistenceAdapter.prototype.set = function (transferRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var key, status, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = hash(transferRequest);
                        status = __assign(__assign({}, transferRequest), { status: 'pending' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.backend
                                .get('transferRequests')
                                .get(this.address)
                                .set(__assign(__assign({}, status), { key: key }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, key];
                    case 3:
                        e_1 = _a.sent();
                        throw new Error(e_1.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GunPersistenceAdapter.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var values, value, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getAllTransferRequests()];
                    case 1:
                        values = _a.sent();
                        value = values.filter(function (data) { return (data === null || data === void 0 ? void 0 : data.key) === key; })[0];
                        if (value) {
                            return [2 /*return*/, value];
                        }
                        else
                            return [2 /*return*/, undefined];
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GunPersistenceAdapter.prototype.remove = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var deleted_1, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        deleted_1 = false;
                        return [4 /*yield*/, this.backend
                                .get('transferRequests')
                                .get(this.address)
                                .map()
                                // @ts-expect-error
                                .val(function (val, field) {
                                var _a;
                                if ((val === null || val === void 0 ? void 0 : val.key) === key && !deleted_1) {
                                    this.back(1).put((_a = {}, _a[field] = null, _a));
                                    deleted_1 = true;
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        e_3 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GunPersistenceAdapter.prototype.has = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var value, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.get(key)];
                    case 1:
                        value = (_a.sent());
                        if (value) {
                            return [2 /*return*/, true];
                        }
                        else
                            return [2 /*return*/, false];
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GunPersistenceAdapter.prototype.getStatus = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var value, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.get(key)];
                    case 1:
                        value = (_a.sent());
                        if (value) {
                            return [2 /*return*/, value.status];
                        }
                        else {
                            throw new Error("No transfer request with key: " + key);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_5 = _a.sent();
                        throw new Error(e_5.message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GunPersistenceAdapter.prototype.setStatus = function (key, status) {
        return __awaiter(this, void 0, void 0, function () {
            var value, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.get(key)];
                    case 1:
                        value = (_a.sent());
                        if (!value) return [3 /*break*/, 3];
                        value.status = status;
                        return [4 /*yield*/, this.backend.get('transferRequest').get(this.address).set(value)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3: throw new Error("No transfer request with key: " + key);
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_6 = _a.sent();
                        throw new Error(e_6.message);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    GunPersistenceAdapter.prototype.getAllTransferRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        values = [];
                        return [4 /*yield*/, this.backend
                                .get('transferRequests')
                                .map()
                                .once(function (d) {
                                if (d) {
                                    values.push(d);
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, values];
                }
            });
        });
    };
    return GunPersistenceAdapter;
}());
export { GunPersistenceAdapter };

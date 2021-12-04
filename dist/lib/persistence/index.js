"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GunPersistenceAdapter = exports.InMemoryPersistenceAdapter = exports.LocalStoragePersistenceAdapter = void 0;
const localStorage_1 = require("./localStorage");
Object.defineProperty(exports, "LocalStoragePersistenceAdapter", { enumerable: true, get: function () { return localStorage_1.LocalStoragePersistenceAdapter; } });
const inMemory_1 = require("./inMemory");
Object.defineProperty(exports, "InMemoryPersistenceAdapter", { enumerable: true, get: function () { return inMemory_1.InMemoryPersistenceAdapter; } });
const gun_1 = require("./gun");
Object.defineProperty(exports, "GunPersistenceAdapter", { enumerable: true, get: function () { return gun_1.GunPersistenceAdapter; } });

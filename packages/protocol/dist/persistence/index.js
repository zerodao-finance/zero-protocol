"use strict";
exports.__esModule = true;
exports.InMemoryPersistenceAdapter = exports.LocalStoragePersistenceAdapter = void 0;
var localStorage_1 = require("./localStorage");
exports.LocalStoragePersistenceAdapter = localStorage_1.LocalStoragePersistenceAdapter;
var inMemory_1 = require("./inMemory");
exports.InMemoryPersistenceAdapter = inMemory_1.InMemoryPersistenceAdapter;
//import { GunPersistenceAdapter } from './gun';
require("./types");

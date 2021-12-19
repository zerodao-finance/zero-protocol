"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const createLogger = (userType) => (0, winston_1.createLogger)({
    level: (process === null || process === void 0 ? void 0 : process.env.NODE_ENV) === 'test' || (process === null || process === void 0 ? void 0 : process.env.REACT_APP_TEST) ? 'debug' : 'info',
    defaultMeta: {
        service: userType !== null && userType !== void 0 ? userType : 'zero.user',
    },
    transports: [new winston_1.transports.Console()],
});
exports.default = createLogger;

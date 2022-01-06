"use strict";
exports.__esModule = true;
var winston_1 = require("winston");
require("./types");
var createLogger = function (userType) {
    return (0, winston_1.createLogger)({
        level: (process === null || process === void 0 ? void 0 : process.env.NODE_ENV) === 'test' || (process === null || process === void 0 ? void 0 : process.env.REACT_APP_TEST) ? 'debug' : 'info',
        defaultMeta: {
            service: userType !== null && userType !== void 0 ? userType : 'zero.user'
        },
        transports: [new winston_1.transports.Console()]
    });
};
exports["default"] = createLogger;

import { createLogger as createWinstonLogger, transports } from 'winston';
var createLogger = function (userType) {
    return createWinstonLogger({
        level: (process === null || process === void 0 ? void 0 : process.env.NODE_ENV) === 'test' || (process === null || process === void 0 ? void 0 : process.env.REACT_APP_TEST) ? 'debug' : 'info',
        defaultMeta: {
            service: userType !== null && userType !== void 0 ? userType : 'zero.user',
        },
        transports: [new transports.Console()],
    });
};
export default createLogger;

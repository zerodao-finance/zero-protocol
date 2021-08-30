import { createLogger as createWinstonLogger, transports } from 'winston';
const createLogger = (userType) => createWinstonLogger({
    level: (process === null || process === void 0 ? void 0 : process.env.NODE_ENV) === 'test' ? 'debug' : 'info',
    defaultMeta: {
        service: userType !== null && userType !== void 0 ? userType : 'zero.user',
    },
    transports: [new transports.Console()],
});
export default createLogger;
//# sourceMappingURL=index.js.map
const {createLogger: createWinstonLogger, transports} = require('winston')

const createLogger = (userType) => createWinstonLogger({
    level: process?.env.NODE_ENV === 'test' ? 'debug': 'info',
    defaultMeta: {
        service: userType ?? 'zero.user'
    },
    transports: [new transports.Console()]
})

module.exports = createLogger;
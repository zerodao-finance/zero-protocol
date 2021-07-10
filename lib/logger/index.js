const {createLogger: createWinstonLogger, transports} = require('winston')

const createLogger = (userType) => createWinstonLogger({
    level: 'info',
    defaultMeta: {
        service: userType ?? 'zero.user'
    },
    transports: [new transports.Console()]
})

module.exports = createLogger;
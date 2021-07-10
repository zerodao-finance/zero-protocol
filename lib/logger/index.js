const {createLogger: createWinstonLogger} = require('winston')

const createLogger = (userType) => createWinstonLogger({
    level: 'info',
    defaultMeta: {
        service: userType ?? 'zero.user'
    }
})

module.exports = createLogger;
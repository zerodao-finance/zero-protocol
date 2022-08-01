import winston, { createLogger as createWinstonLogger, transports, Logger } from 'winston';
import { UserTypes } from './types';

const createLogger = (userType?: UserTypes) =>
	createWinstonLogger({
		level: process?.env.NODE_ENV === 'test' || process?.env.REACT_APP_TEST ? 'debug' : 'info',
		defaultMeta: {
			service: userType ?? 'zero.user',
		},
		transports: [new transports.Console()],
	});

export default createLogger;
export { Logger };

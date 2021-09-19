import winston, { Logger } from 'winston';
import { UserTypes } from './types';
declare const createLogger: (userType?: UserTypes) => winston.Logger;
export default createLogger;
export { Logger };

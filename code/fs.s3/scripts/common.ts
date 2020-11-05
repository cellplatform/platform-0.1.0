import * as dotenv from 'dotenv';
dotenv.config();

export * from '../src';
export { log, AWS, time } from '../src/common';

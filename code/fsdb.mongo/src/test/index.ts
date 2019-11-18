import * as dotenv from 'dotenv';

export { dotenv };
dotenv.config();

export { fs } from '@platform/fs';
export { expect, expectError } from '@platform/test';
export * from '../common';

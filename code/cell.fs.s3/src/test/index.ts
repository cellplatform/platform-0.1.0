import { fs, Schema } from '../common';

fs.env.load();
Schema.Uri.ALLOW.NS = ['foo*'];

export * from '../common';
export { expect, expectError } from '@platform/test';
export { log } from '@platform/log/lib/server';
export { TestUtil } from './TestUtil';

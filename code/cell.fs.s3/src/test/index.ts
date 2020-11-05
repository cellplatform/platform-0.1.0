import { fs, Schema } from '../common';

fs.env.load();
Schema.uri.ALLOW.NS = ['foo*'];

export * from '../common';
export { expect, expectError } from '@platform/test';
export { log } from '@platform/log/lib/server';
export { util } from './util';

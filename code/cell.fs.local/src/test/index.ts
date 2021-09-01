import { Schema } from '../common';

export { expect, expectError } from '@platform/test';
export { log } from '@platform/log/lib/server';

export * from '../common';
export * from './TestUtil';

Schema.Uri.ALLOW.NS = ['foo*'];

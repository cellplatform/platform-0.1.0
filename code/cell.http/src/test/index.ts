import { Schema } from '../common';

export { expect, expectError } from '@platform/test';
export * from '../common';

Schema.uri.ALLOW.NS = ['foo*'];

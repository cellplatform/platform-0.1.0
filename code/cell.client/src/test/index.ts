export { expect, expectError } from '@platform/test';
export * from '../common';

import { Schema } from '../common';
Schema.uri.ALLOW.NS = ['foo*'];

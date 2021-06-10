import { Schema } from '../node/common';

export { expect, expectError } from '@platform/test';
export * from '../node/common';

Schema.Uri.ALLOW.NS = ['foo*'];

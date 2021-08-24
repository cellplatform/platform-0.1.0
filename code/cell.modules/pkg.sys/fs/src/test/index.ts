export { expect, expectError } from '@platform/test';
import { Schema } from '../web/common';

export * from '../web/common';
export * from './TestFs';

Schema.Uri.ALLOW.NS = ['foo*'];

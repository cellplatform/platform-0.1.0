export { expect, expectError } from '@platform/test';
import { Schema } from '../web/common';

export { FsBus } from '../web';
export * from '../web/common';
export * from './TestFs';
export * from './TestPrep';

Schema.Uri.ALLOW.NS = ['foo*'];

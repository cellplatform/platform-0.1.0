export { expect, expectError } from '@platform/test';
export { log } from '@platform/log/lib/server';
import { Schema } from '../web/common';

export { Filesystem } from '../web';
export * from '../web/common';
export * from './TestFs';
export * from './TestPrep';

Schema.Uri.ALLOW.NS = ['foo*'];

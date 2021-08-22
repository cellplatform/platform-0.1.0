import { Schema } from '../web/common';

export { expect } from '@platform/test';
export * from '../web/common';
export * from './TestFs';

Schema.Uri.ALLOW.NS = ['foo*'];

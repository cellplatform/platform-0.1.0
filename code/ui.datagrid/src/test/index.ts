import './dom';
import { Schema } from '../common';

export { expect } from '@platform/test';
export * from '../common';

Schema.uri.ALLOW.NS = ['foo*'];

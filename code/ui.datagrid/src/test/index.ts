import './dom';
import { Schema } from '../common';
Schema.uri.ALLOW.NS = ['foo*'];

export { expect } from '@platform/test';
export * from '../common';

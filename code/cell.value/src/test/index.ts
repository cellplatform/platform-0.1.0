import { Schema } from '@platform/cell.schema';

export { expect } from '@platform/test';
export { fs } from '@platform/fs';
export * from '../common';

before(() => {
  Schema.uri.ALLOW.NS = ['abcd', 'foo', 'bar', 'zoo', 'foobar'];
});

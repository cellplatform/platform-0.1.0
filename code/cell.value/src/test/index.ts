import { TEST as URI_TEST } from '@platform/cell.schema/lib/uri/Uri';

export { expect } from '@platform/test';
export { fs } from '@platform/fs';
export * from '../common';

before(() => {
  URI_TEST.NS.ALLOW = ['abcd', 'foo', 'bar', 'zoo', 'foobar'];
});

import { TEST as URI_TEST } from '@platform/cell.schema/lib/uri/Uri';
import * as models from './models';

export { models };
export * from './types';

before(() => {
  URI_TEST.NS.ALLOW = ['abcd', 'foo', 'bar', 'zoo', 'foobar'];
});

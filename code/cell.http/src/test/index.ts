export { expect, expectError } from '@platform/test';
import { mock } from './mock';

export { mock };
export * from '../server/common';

before(async () => mock.reset());

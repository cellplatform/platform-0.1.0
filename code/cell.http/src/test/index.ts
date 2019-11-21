export { expect, expectError } from '@platform/test';
import { mock, createMock } from './mock';

export { mock, createMock };
export * from '../server/common';

before(async () => mock.reset());

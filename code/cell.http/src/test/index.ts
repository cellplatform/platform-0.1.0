import { value } from '@platform/util.value';
export { expect, expectError } from '@platform/test';
import { mock, createMock } from './mock';

export { mock, createMock };
export * from '../server/common';

before(async () => mock.reset());

/**
 * Walks an object tree stripping hash values.
 */
export function stripHashes(input: object) {
  if (input) {
    value.object.walk(input, obj => delete obj.hash);
  }
  return input;
}

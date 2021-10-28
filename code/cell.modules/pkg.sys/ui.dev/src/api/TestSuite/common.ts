export * from '../../common';
import { is } from '../../common';

export const DEFAULT = {
  TIMEOUT: 3000,
};

export const Is = {
  promise: is.promise,
  suite(input: any) {
    if (typeof input === 'string' && input.startsWith('TestSuite.')) return true;
    if (typeof input !== 'object' || input === null) return false;
    if (typeof input.id !== 'string') return false;
    return (
      input.kind === 'TestSuite' &&
      typeof input.describe === 'function' &&
      typeof input.it === 'function' &&
      typeof input.run === 'function'
    );
  },
  test(input: any) {
    if (typeof input === 'string' && input.startsWith('Test.')) return true;
    if (typeof input !== 'object' || input === null) return false;
    if (typeof input.id !== 'string') return false;
    return input.kind === 'Test' && typeof input.run === 'function';
  },
};

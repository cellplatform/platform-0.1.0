export * from '../../common';

export const DEFAULT = {
  TIMEOUT: 3000,
};

export function isSuite(input: any) {
  if (typeof input !== 'object') return false;
  if (typeof input.id !== 'string') return false;
  return (
    input.id.startsWith('TestSuite.') &&
    typeof input.describe === 'function' &&
    typeof input.it === 'function' &&
    typeof input.run === 'function'
  );
}

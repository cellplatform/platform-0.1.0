/**
 * Determines if the given object is a builder.
 */
export function isBuilder(input?: any) {
  if (input === null || typeof input !== 'object') {
    return false;
  } else {
    return (input as any).__KIND__ === 'BUILDER';
  }
}

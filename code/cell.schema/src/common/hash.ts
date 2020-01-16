import { hash } from '@platform/util.hash';

/**
 * Generate a self-describing SHA256 hash of the given object.
 */
export function sha256(input: any) {
  return `sha256-${hash.sha256(input)}`;
}

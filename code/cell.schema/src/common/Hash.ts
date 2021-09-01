import { hash } from '@platform/util.hash';

export const Hash = {
  /**
   * Generate a self-describing SHA256 hash of the given object.
   */
  sha256(input: any) {
    return `sha256-${hash.sha256(input)}`;
  },
};

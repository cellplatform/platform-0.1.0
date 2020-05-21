import * as semver from 'semver';

/**
 * Equality comparison.
 */
export function eq(v1: string, v2: string) {
  try {
    return semver.eq(v1, v2, true);
  } catch (error) {
    return false;
  }
}

/**
 * Determine if the version is valid.
 */
export function isValid(version: string) {
  return semver.valid(version);
}

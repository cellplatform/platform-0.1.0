import { semver } from '../common';

/**
 * Initialize a new version
 */
export function version(value: string) {
  return Version.create(value);
}

/**
 * Represents a semantic version.
 */
export class Version {
  /**
   * [Static]
   */
  public static create(value: string) {
    return new Version(value);
  }

  /**
   * [Lifecycle]
   */
  private constructor(raw: string) {
    raw = (raw || '').trim();
    this.raw = raw;
  }

  /**
   * [Fields]
   */
  public readonly raw: string;

  /**
   * [Methods]
   */
  public toString() {
    return this.raw;
  }
}

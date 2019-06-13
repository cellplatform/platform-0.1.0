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
  private constructor(value: string) {
    this.value = value;
  }

  /**
   * [Fields]
   */
  public readonly value: string;

  /**
   * [Methods]
   */
  public toString() {
    return this.value;
  }
}

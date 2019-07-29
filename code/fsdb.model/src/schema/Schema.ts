/**
 * Internal schema for an NeDoc
 */
export class Schema {
  /**
   * [Lifecycle]
   */
  public static create = () => new Schema();
  private constructor() {}

  /**
   * [Fields]
   */
  public readonly version = 'v2';

  /**
   * [Properties]
   */
  public org(id: string = '*') {
    return `${this.version}/ORG/${id}`;
  }
}

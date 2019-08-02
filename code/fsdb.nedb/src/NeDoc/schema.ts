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
  public readonly sys = {
    timestamps: '~sys/timestamps',
  };
}

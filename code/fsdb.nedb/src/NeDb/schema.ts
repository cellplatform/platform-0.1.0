/**
 * Internal schema for an NeDb document store.
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

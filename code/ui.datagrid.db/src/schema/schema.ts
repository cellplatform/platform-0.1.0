import { DbSchema } from './DbSchema';
import { GridSchema } from './GridSchema';

/**
 * DB/Grid key schema.
 */
export class SyncSchema {
  /**
   * [Lifecycle]
   */
  public static create = (args: {}) => new SyncSchema(args);
  private constructor(args: {}) {
    this.db = DbSchema.create(args);
    this.grid = GridSchema.create(args);
  }

  /**
   * [Fields]
   */
  public readonly db: DbSchema;
  public readonly grid: GridSchema;
}

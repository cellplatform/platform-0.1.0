import { DbSchema } from './DbSchema';
import { GridSchema } from './GridSchema';

/**
 * DB/Grid key schema.
 */
export class SyncSchema {
  /**
   * [Lifecycle]
   */
  public static create = () => new SyncSchema();
  private constructor() {
    this.db = DbSchema.create();
    this.grid = GridSchema.create();
  }

  /**
   * [Fields]
   */
  public readonly db: DbSchema;
  public readonly grid: GridSchema;
}

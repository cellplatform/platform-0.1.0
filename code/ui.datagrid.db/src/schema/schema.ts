import { DbSchema } from './DbSchema';
import { GridSchema } from './GridSchema';

/**
 * DB/Grid key schema.
 */
export class SyncSchema {
  public static create = (args: {}) => new SyncSchema(args);
  private constructor(args: {}) {
    this.db = DbSchema.create(args);
    this.grid = GridSchema.create(args);
  }

  public db: DbSchema;
  public grid: GridSchema;
}

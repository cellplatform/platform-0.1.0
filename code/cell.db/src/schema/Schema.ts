import { id as generate, t } from '../common';

export type SchemaCoordType = 'CELL' | 'COL' | 'ROW';

/**
 * Schema of DB paths.
 */
export class Schema {
  public static query = {
    cells: '/CELL/*',
    rows: '/ROW/*',
    columns: '/COL/*',
  };

  public static ns = (id?: string) => new NsSchema({ id });
}

/**
 * Schema for `namespace`
 * (a set of logically associated cells, aka a "sheet").
 */
export class NsSchema {
  public readonly id: string;
  public readonly path: string;

  constructor(args: { id?: string }) {
    this.id = args.id || generate.cuid();
    this.path = `NS/${this.id}`;
  }

  /**
   * [Methods]
   */
  public cell(id?: string) {
    return new CoordSchema({ type: 'CELL', ns: this, id });
  }

  public column(id?: string) {
    return new CoordSchema({ type: 'COL', ns: this, id });
  }

  public row(id?: string) {
    return new CoordSchema({ type: 'ROW', ns: this, id });
  }
}

/**
 * Schema for a NS coordinate such as a `cell`, `column` or `row`.
 */
export class CoordSchema {
  public readonly ns: NsSchema;
  public readonly id: string;
  public readonly path: string;
  public readonly type: SchemaCoordType;

  constructor(args: { type: SchemaCoordType; ns: NsSchema; id?: string }) {
    this.ns = args.ns;
    this.id = args.id || generate.shortid();
    this.type = args.type;
    this.path = `${args.ns.path}/${args.type}/${this.id}`;
  }
}

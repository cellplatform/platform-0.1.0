import { id as generate } from '../common';

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

  public static ns = (id?: string) => new SchemaNamespace({ id });
}

/**
 * Schema for `namespace`
 * (a set of logically associated cells, aka a "sheet").
 */
export class SchemaNamespace {
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
    return new SchemaCoord({ type: 'CELL', ns: this, id });
  }

  public column(id?: string) {
    return new SchemaCoord({ type: 'COL', ns: this, id });
  }

  public row(id?: string) {
    return new SchemaCoord({ type: 'ROW', ns: this, id });
  }
}

/**
 * Schema for a NS coordinate such as a `cell`, `column` or `row`.
 */
export class SchemaCoord {
  public readonly ns: SchemaNamespace;
  public readonly id: string;
  public readonly path: string;

  constructor(args: { type: SchemaCoordType; ns: SchemaNamespace; id?: string }) {
    this.ns = args.ns;
    this.id = args.id || generate.shortid();
    this.path = `${args.ns.path}/${args.type}/${this.id}`;
  }
}

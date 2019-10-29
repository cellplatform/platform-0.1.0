import { id as generate, coord } from '../common';

export type SchemaCoordType = 'cell' | 'col' | 'row';

/**
 * Schema of DB paths.
 */
export class Schema {
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
    return new SchemaCoord({ type: 'cell', ns: this, id });
  }

  public column(id?: string) {
    return new SchemaCoord({ type: 'col', ns: this, id });
  }

  public row(id?: string) {
    return new SchemaCoord({ type: 'row', ns: this, id });
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

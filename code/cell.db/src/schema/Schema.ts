import { id as generate, t, coord } from '../common';

const { Uri } = coord;

export type SchemaCoordType = 'CELL' | 'COL' | 'ROW';

/**
 * Schema of DB paths.
 */
export class Schema {
  public static ns = (id?: string) => new NsSchema({ id });

  public static query = {
    cells: '/CELL/*',
    rows: '/ROW/*',
    columns: '/COL/*',
  };

  public static uri = {
    fromNs: (ns: t.IModelNs) => NsSchema.uri({ path: ns.path }),
    fromCell: (cell: t.IModelCell) => CoordSchema.uri({ path: cell.path }),
    fromRow: (row: t.IModelRow) => CoordSchema.uri({ path: row.path }),
    fromColumn: (column: t.IModelColumn) => CoordSchema.uri({ path: column.path }),
  };
}

/**
 * Schema for `namespace`
 * (a set of logically associated cells, aka a "sheet").
 */
export class NsSchema {
  public readonly id: string;
  public readonly path: string;
  public readonly uri: string;

  constructor(args: { id?: string }) {
    let id = args.id || generate.cuid();
    if (Uri.is.uri(id)) {
      const uri = Uri.parse(id);
      if (uri.error) {
        throw new Error(uri.error.message);
      }
      if (uri.data.type !== 'ns') {
        throw new Error(`The given URI does not represent a namespace ("${uri.text}").`);
      }
      id = uri.data.id;
    }

    this.id = id;
    this.path = `NS/${id}`;
    this.uri = Uri.generate.ns({ ns: id });
  }

  /**
   * [Methods]
   */
  public cell(key?: string) {
    key = key || generate.shortid();
    const uri = Uri.generate.cell({ ns: this.id, key });
    return new CoordSchema({ type: 'CELL', ns: this, id: key, uri });
  }

  public column(key?: string) {
    key = key || generate.shortid();
    const uri = Uri.generate.column({ ns: this.id, key });
    return new CoordSchema({ type: 'COL', ns: this, id: key, uri });
  }

  public row(key?: string) {
    key = key || generate.shortid();
    const uri = Uri.generate.row({ ns: this.id, key });
    return new CoordSchema({ type: 'ROW', ns: this, id: key, uri });
  }

  public static uri(args: { path: string }) {
    const parts = args.path.split('/');
    const type = parts[0];
    const id = parts[1];

    if (type === 'NS') {
      return Uri.generate.ns({ ns: id });
    }

    throw new Error(`Model path could not be converted to URI ("${args.path}")`);
  }
}

/**
 * Schema for a NS coordinate such as a `cell`, `column` or `row`.
 */
export class CoordSchema {
  public readonly type: SchemaCoordType;
  public readonly ns: NsSchema;
  public readonly id: string;
  public readonly path: string;
  public readonly uri: string;

  constructor(args: { type: SchemaCoordType; ns: NsSchema; id: string; uri: string }) {
    this.ns = args.ns;
    this.id = args.id;
    this.type = args.type;
    this.path = `${args.ns.path}/${args.type}/${this.id}`;
    this.uri = args.uri;
  }

  public static uri(args: { path: string }) {
    const parts = args.path.split('/');
    const ns = parts[1];
    const type = parts[2] as SchemaCoordType;
    const key = parts[3];

    if (type === 'CELL') {
      return Uri.generate.cell({ ns, key });
    }
    if (type === 'ROW') {
      return Uri.generate.row({ ns, key });
    }
    if (type === 'COL') {
      return Uri.generate.column({ ns, key });
    }

    throw new Error(`Model path could not be converted to URI ("${args.path}")`);
  }
}

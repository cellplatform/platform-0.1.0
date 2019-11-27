import { cuid, t } from '../common';
import { Uri } from '../uri';

export type SchemaCoordType = 'CELL' | 'COL' | 'ROW';

export type SchemaType<T extends t.IUri> = t.IUriParts<T> & { path: string };

export type PathString = string;
export type UriString = string;

/**
 * Schema of DB paths.
 */
export class Schema {
  public static uri = Uri;

  public static ns = (id?: string) => new NsSchema({ id });

  public static query = {
    cells: '/CELL/*',
    rows: '/ROW/*',
    columns: '/COL/*',
  };

  public static from = {
    ns(input: string | t.IDbModelNs) {
      return from<t.INsUri>({
        input,
        toUri: path => NsSchema.uri({ path }),
        toPath: uri => Schema.ns(uri).path,
      });
    },
    cell(input: string | t.IDbModelCell) {
      return from<t.ICellUri>({
        input,
        toUri: path => CoordSchema.uri({ path }),
        toPath: uri => {
          const { parts } = Uri.parse<t.ICellUri>(uri);
          return Schema.ns(parts.ns).cell(parts.key).path;
        },
      });
    },
    row(input: string | t.IDbModelRow) {
      return from<t.IRowUri>({
        input,
        toUri: path => CoordSchema.uri({ path }),
        toPath: uri => {
          const { parts } = Uri.parse<t.IRowUri>(uri);
          return Schema.ns(parts.ns).row(parts.key).path;
        },
      });
    },
    column(input: string | t.IDbModelColumn) {
      return from<t.IColumnUri>({
        input,
        toUri: path => CoordSchema.uri({ path }),
        toPath: uri => {
          const { parts } = Uri.parse<t.IColumnUri>(uri);
          return Schema.ns(parts.ns).column(parts.key).path;
        },
      });
    },
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
    let id = args.id || cuid();
    if (Uri.is.uri(id)) {
      const uri = Uri.parse(id);
      if (uri.error) {
        throw new Error(uri.error.message);
      }
      if (uri.parts.type !== 'ns') {
        throw new Error(`The given URI does not represent a namespace ("${uri.toString()}").`);
      }
      id = uri.parts.id;
    }

    this.id = id;
    this.path = `NS/${id}`;
    this.uri = Uri.string.ns(id);
  }

  /**
   * [Methods]
   */
  public cell(key: string) {
    const uri = Uri.string.cell(this.id, key);
    return new CoordSchema({ type: 'CELL', ns: this, id: key, uri });
  }

  public column(key: string) {
    const uri = Uri.string.column(this.id, key);
    return new CoordSchema({ type: 'COL', ns: this, id: key, uri });
  }

  public row(key: string) {
    const uri = Uri.string.row(this.id, key);
    return new CoordSchema({ type: 'ROW', ns: this, id: key, uri });
  }

  public static uri(args: { path: string }) {
    const parts = args.path.split('/');
    const type = parts[0];
    const id = parts[1];

    if (type === 'NS') {
      return Uri.string.ns(id);
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
      return Uri.string.cell(ns, key);
    }
    if (type === 'ROW') {
      return Uri.string.row(ns, key);
    }
    if (type === 'COL') {
      return Uri.string.column(ns, key);
    }

    throw new Error(`Model path could not be converted to URI ("${args.path}")`);
  }
}

/**
 * [Helpers]
 */

const from = <T extends t.IUri>(args: {
  input: PathString | UriString | { path: string };
  toUri: (path: string) => string;
  toPath: (uri: string) => string;
}): SchemaType<T> => {
  let path = '';
  let uri = '';

  if (typeof args.input === 'object') {
    path = args.input.path;
    uri = args.toUri(path);
  } else {
    if (Uri.is.uri(args.input)) {
      uri = args.input;
      path = args.toPath(uri);
    } else {
      path = args.input;
      uri = args.toUri(path);
    }
  }

  if (!path) {
    throw new Error(`Model schema [path] could not be derived.`);
  }

  if (!uri) {
    throw new Error(`Model [uri] could not be derived.`);
  }

  const parts = Uri.parse<T>(uri);
  return { ...parts, path };
};

import { constants, ERROR, ErrorList, R, Schema, t, util, value } from '../common';
import { TypeValue } from '../TypeValue';
import { TypeScript } from '../TypeScript';

/**
 * Client that retrieves the type definition of a namespace
 * from the network.
 */
export class TypeClient2 {
  /**
   * Load types from the network using the given HTTP client.
   */
  public static client(client: string | t.IHttpClient) {
    const fetch = util.fetcher.fromClient({ client });
    return {
      load: (ns: string) => TypeClient2.load({ ns, fetch }),
    };
  }

  /**
   * Retrieve and assemble types from the network.
   */
  public static async load(args: { ns: string; fetch: t.ISheetFetcher }) {
    const { ns, fetch } = args;
    return load({ ns, fetch });
  }

  /**
   * Converts type definitions to valid typescript declarations.
   */
  public static typescript(def: t.INsTypeDef, options: { header?: boolean } = {}) {
    const api = {
      /**
       * Comments to insert at the head of the typescript.
       */
      get header() {
        const uri = def.uri;
        const pkg = constants.PKG.name || 'Unnamed';
        return toTypescriptHeader({ uri, pkg });
      },

      /**
       * Generated typescript decalration(s).
       */
      get declaration() {
        const header = value.defaultValue(options.header, true) ? api.header : undefined;
        const typename = def.typename;
        const types = def.columns.map(({ prop, type, optional }) => ({ prop, type, optional }));
        return TypeScript.toDeclaration({ typename, types, header });
      },

      /**
       * Save the typescript declarations as a binary file.
       */
      async save(fs: t.IFs, dir: string, options: { filename?: string } = {}) {
        // Prepare paths.
        await fs.ensureDir(dir);
        let path = fs.join(dir, options.filename || def.typename);
        path = path.endsWith('.d.ts') ? path : `${path}.d.ts`;

        // Save file.
        const data = api.declaration;
        await fs.writeFile(path, data);
        return { path, data };
      },

      toString() {
        return api.declaration;
      },
    };

    return api;
  }
}

/**
 * [Helpers]
 */

export async function load(args: {
  ns: string;
  fetch: t.ISheetFetcher;
  errors?: ErrorList;
  visited?: string[];
}): Promise<t.INsTypeDef> {
  const { fetch, visited = [] } = args;
  const errors = args.errors || ErrorList.create({ defaultType: ERROR.TYPE.DEF });
  const ns = util.formatNs(args.ns);

  // Prepare return object.
  const done = (args: { typename?: string; columns?: t.IColumnTypeDef[] } = {}) => {
    const { typename = '', columns = [] } = args;
    const uri = ns;
    const errorList = [
      ...errors.list,
      ...columns.reduce((acc, { error }) => (error ? [...acc, error] : acc), [] as t.IError[]),
    ];
    const ok = errorList.length === 0;
    const res: t.INsTypeDef = {
      ok,
      uri,
      typename,
      columns,
      errors: R.uniq(errorList),
    };
    return res;
  };

  // Validate the URI.
  const uri = Schema.uri.parse<t.INsUri>(ns);
  if (uri.error) {
    const message = `Invalid namespace URI ("${args.ns}"). ${uri.error.message}`;
    errors.add(message);
  }
  if (uri.parts.type !== 'NS') {
    const message = `Invalid namespace URI. Must be "ns", given: [${args.ns}]`;
    errors.add(message);
  }

  // Short-circuit any cirular references.
  if (visited.includes(ns)) {
    const message = `The namespace "${ns}" leads back to itself (circular reference).`;
    errors.add(message, { errorType: ERROR.TYPE.CIRCULAR_REF });
    return done();
  }
  visited.push(ns);

  if (!errors.ok) {
    return done();
  }

  try {
    // Retrieve namespace.
    const fetchedType = await fetch.getType({ ns });
    if (!fetchedType.exists) {
      const message = `The namespace "${ns}" does not exist.`;
      errors.add(message, { errorType: ERROR.TYPE.DEF_NOT_FOUND });
      return done();
    }
    if (fetchedType.error) {
      errors.add(fetchedType.error.message);
      return done();
    }
    if (fetchedType.type.implements === ns) {
      const message = `The namespace ("${ns}") cannot implement itself (circular-ref).`;
      errors.add(message, { errorType: ERROR.TYPE.CIRCULAR_REF });
      return done();
    }

    // Retrieve columns.
    const fetchedColumns = await fetch.getColumns({ ns });
    const { columns } = fetchedColumns;
    if (fetchedColumns.error) {
      errors.add(fetchedColumns.error.message);
      return done();
    }

    // Parse type details.
    const typename = (fetchedType.type?.typename || '').trim();
    const columnTypeDefs = await readColumns({ fetch, columns, errors, visited });
    return done({ typename, columns: columnTypeDefs });
  } catch (error) {
    // Failure.
    errors.add(`Failed while loading type for "${ns}". ${error.message}`);
    return done();
  }
}

export async function readColumns(args: {
  fetch: t.ISheetFetcher;
  columns: t.IColumnMap;
  visited?: string[];
  errors?: ErrorList;
}): Promise<t.IColumnTypeDef[]> {
  const { fetch, visited, errors } = args;
  const wait = Object.keys(args.columns)
    .map(column => {
      const props = args.columns[column]?.props?.prop as t.CellTypeProp;
      return { column, props };
    })
    .filter(({ props }) => Boolean(props))
    .map(({ column, props }) => readColumn({ fetch, column, props, visited, errors }));
  const columns = await Promise.all(wait);
  return R.sortBy(R.prop('column'), columns);
}

export async function readColumn(args: {
  fetch: t.ISheetFetcher;
  column: string;
  props: t.CellTypeProp;
  visited?: string[];
  errors?: ErrorList;
}): Promise<t.IColumnTypeDef> {
  const { fetch, column, visited, errors } = args;
  const target = args.props.target;
  let type = TypeValue.parse(args.props.type);
  let error: t.IError | undefined;

  let prop = (args.props.name || '').trim();
  const optional = prop.endsWith('?');
  prop = optional ? prop.replace(/\?$/, '') : prop;

  if (type.kind === 'REF') {
    const ref = type;
    const res = await readRef({ fetch, column, visited, errors, ref });
    type = res.type;
    error = res.error ? res.error : error;
  }

  const def: t.IColumnTypeDef = { column, prop, optional, type, target, error };
  return value.deleteUndefined(def);
}

export async function readRef(args: {
  fetch: t.ISheetFetcher;
  column: string;
  ref: t.ITypeRef;
  visited?: string[];
  errors?: ErrorList;
}): Promise<{ type: t.ITypeRef | t.ITypeUnknown; error?: t.IError }> {
  const { column, ref, fetch, visited = [] } = args;
  const errors = args.errors || ErrorList.create({ defaultType: ERROR.TYPE.DEF });
  const ns = ref.uri;
  const unknown: t.ITypeUnknown = { kind: 'UNKNOWN', typename: ns };

  if (!Schema.uri.is.ns(ns)) {
    errors.add(`The referenced type in column '${column}' is not a namespace.`);
    return { type: unknown };
  }

  // Retrieve the referenced namespace.
  const loadResponse = await load({ ns, fetch, visited }); // <== RECURSION 🌳

  // Check for errors.
  const CIRCULAR_REF = ERROR.TYPE.CIRCULAR_REF;
  const isCircular = loadResponse.errors.some(err => err.type === CIRCULAR_REF);
  if (isCircular) {
    const msg = `The referenced type in column '${column}' ("${ns}") contains a circular reference.`;
    const children = loadResponse.errors;
    return {
      type: unknown,
      error: errors.add(msg, { children, errorType: CIRCULAR_REF }),
    };
  }

  if (loadResponse.errors.length > 0) {
    const msg = `The referenced type in column '${column}' ("${ns}") could not be read.`;
    const children = loadResponse.errors;
    return {
      type: unknown,
      error: errors.add(msg, { children, errorType: ERROR.TYPE.REF }),
    };
  }

  // Build the reference.
  const { typename } = loadResponse;
  const types: t.ITypeDef[] = loadResponse.columns.map(({ prop, type }) => ({ prop, type }));
  const type: t.ITypeRef = { ...ref, typename, types };
  return { type };
}

function toTypescriptHeader(args: { uri: string; pkg: string }) {
  return `
  /**
   * Generated by [${args.pkg}] for namespace:
   * 
   *      "${args.uri}"
   * 
   * Notes: 
   * 
   *    - Do NOT manually edit this file.
   *    - Do check this file into source control.
   *    - Import the [.d.ts] file within your consuming module
   *      that uses [TypedSheet]'s to operate on the namespace
   *      programatically with strong-typing.
   * 
   */`.substring(1);
}

import { Subject } from 'rxjs';

import { ERROR, ErrorList, MemoryCache, R, Schema, t, util, value, Cache } from '../common';
import { TypeValue } from '../TypeValue';

type L = Subject<t.INsTypeDef>;

// const toCacheKey = (uri: string) => `TypeClient/${uri}`;
// const toCache = (cache?: t.IMemoryCache) => cache || MemoryCache.create();

const toErrorList = (errors?: ErrorList) =>
  errors || ErrorList.create({ defaultType: ERROR.TYPE.DEF });

/**
 * Load a type-definition from the network.
 */
export async function load(args: {
  ns: string;
  fetch: t.ISheetFetcher;
  errors?: ErrorList;
  visited?: string[];
  cache?: t.IMemoryCache;
}): Promise<t.INsTypeDef> {
  const { fetch, visited = [] } = args;
  const errors = toErrorList(args.errors);
  const ns = util.formatNs(args.ns);

  // Loading cache.
  const cache = Cache.toCache(args.cache);
  const cacheKey = Cache.toKey(ns);
  const loading$ = new Subject<t.INsTypeDef>();
  cache.put(cacheKey, loading$);
  loading$.subscribe(def => cache.put(cacheKey, def));

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
    loading$.next(res);
    loading$.complete();
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

  // Short-circuit any circular references.
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
    return done({
      typename: (fetchedType.type?.typename || '').trim(),
      columns: await readColumns({ fetch, columns, errors, cache, visited }),
    });
  } catch (error) {
    // Failure.
    errors.add(`Failed while loading type for "${ns}". ${error.message}`);
    return done();
  }
}

/**
 * Read and parse type definitions for the given columns.
 */
export async function readColumns(args: {
  fetch: t.ISheetFetcher;
  columns: t.IColumnMap;
  visited?: string[];
  errors?: ErrorList;
  cache?: t.IMemoryCache;
}): Promise<t.IColumnTypeDef[]> {
  const { fetch, visited, errors, cache } = args;

  const getProps = (column: string) => {
    const props = args.columns[column]?.props?.prop as t.CellTypeProp;
    return { column, props };
  };

  // Read columns in (either parsing simple types, or retrieve REFs from network).
  const wait = Object.keys(args.columns)
    .map(column => getProps(column))
    .filter(({ props }) => Boolean(props))
    .map(({ column, props }) => readColumn({ fetch, column, props, visited, cache, errors }));
  const columns = R.sortBy(R.prop('column'), await Promise.all(wait));

  // Finish up.
  validateColumns({ columns, errors });
  return columns;
}

export async function readColumn(args: {
  fetch: t.ISheetFetcher;
  column: string;
  props: t.CellTypeProp;
  visited?: string[];
  errors?: ErrorList;
  cache?: t.IMemoryCache;
}): Promise<t.IColumnTypeDef> {
  const { fetch, column, visited, errors, cache } = args;
  const target = args.props.target;
  let type = TypeValue.parse(args.props.type).type;
  let error: t.IError | undefined;

  let prop = (args.props.name || '').trim();
  const optional = prop.endsWith('?') ? true : undefined;
  prop = optional ? prop.replace(/\?$/, '') : prop;

  if (type.kind === 'REF') {
    const ref = type;
    const res = await readRef({ fetch, column, errors, ref, visited, cache });
    type = res.type;
    error = res.error ? res.error : error;
  }

  const def: t.IColumnTypeDef = { column, prop, optional, type, target, error };
  return value.deleteUndefined(def);
}

/**
 * Populate a type REF from the network.
 */
export async function readRef(args: {
  fetch: t.ISheetFetcher;
  column: string;
  ref: t.ITypeRef;
  visited?: string[];
  errors?: ErrorList;
  cache?: t.IMemoryCache;
}): Promise<{ type: t.IType; error?: t.IError }> {
  const { column, ref, fetch, visited = [] } = args;
  const errors = toErrorList(args.errors);

  const uri = Schema.uri;
  const isColumn = uri.is.column(ref.uri);
  const columnUri = isColumn ? uri.parse<t.IColumnUri>(ref.uri) : undefined;
  const nsUri = columnUri ? uri.create.ns(columnUri.parts.ns) : ref.uri;
  const unknown: t.ITypeUnknown = { kind: 'UNKNOWN', typename: nsUri };

  if (!Schema.uri.is.ns(nsUri)) {
    errors.add(`The referenced type in column '${column}' is not a namespace.`);
    return { type: unknown };
  }

  const cache = Cache.toCache(args.cache);
  const cacheKey = Cache.toKey(nsUri);
  const loading$ = cache.get(cacheKey) instanceof Subject ? cache.get<L>(cacheKey) : undefined;

  // Retrieve the referenced namespace.
  const loadResponse = loading$
    ? await loading$.toPromise() // Wait for the in-progress load operation to return from the cache.
    : await load({ ns: nsUri, fetch, visited, cache }); // <== RECURSION 🌳

  // Check for errors.
  const CIRCULAR_REF = ERROR.TYPE.CIRCULAR_REF;
  const isCircular = loadResponse.errors.some(err => err.type === CIRCULAR_REF);
  if (isCircular) {
    const message = `The referenced type in column '${column}' ("${nsUri}") contains a circular reference.`;
    const children = loadResponse.errors;
    return {
      type: unknown,
      error: errors.add(message, { children, errorType: CIRCULAR_REF }),
    };
  }

  if (loadResponse.errors.length > 0) {
    const msg = `The referenced type in column '${column}' ("${nsUri}") could not be read.`;
    const children = loadResponse.errors;
    return {
      type: unknown,
      error: errors.add(msg, { children, errorType: ERROR.TYPE.REF }),
    };
  }

  // Build the reference.
  if (columnUri) {
    // Column REF.
    const columnDef = loadResponse.columns.find(item => item.column === columnUri.parts.key);
    if (!columnDef) {
      const uri = columnUri.toString();
      const msg = `The referenced column-type in column '${column}' ("${uri}") does not exist in the retrieved namespace.`;
      return {
        type: unknown,
        error: errors.add(msg, { errorType: ERROR.TYPE.REF }),
      };
    }
    const type = columnDef.type;
    return { type };
  } else {
    // Namespace REF.
    const { typename } = loadResponse;
    const types: t.ITypeDef[] = loadResponse.columns.map(({ prop, type }) => ({ prop, type }));
    const type: t.ITypeRef = { ...ref, typename, types };
    return { type };
  }
}

export function validateColumns(args: { columns: t.IColumnTypeDef[]; errors?: ErrorList }) {
  const { columns } = args;
  const errors = toErrorList(args.errors);

  // Ensure there are no duplicate property names.
  (() => {
    const props = columns.map(c => c.prop);
    const duplicates: string[] = [];
    props.forEach(name => {
      if (!duplicates.includes(name)) {
        if (props.filter(prop => prop === name).length > 1) {
          duplicates.push(name);
        }
      }
    });

    duplicates.forEach(name => {
      const conficts = columns.filter(({ prop }) => prop === name).map(({ column }) => column);
      const message = `The property name '${name}' is duplicated in columns [${conficts}]. Must be unique.`;
      errors.add(message, { errorType: ERROR.TYPE.PROP.DUPLICATE_NAME });
    });
  })();

  // Finish up.
  return columns;
}

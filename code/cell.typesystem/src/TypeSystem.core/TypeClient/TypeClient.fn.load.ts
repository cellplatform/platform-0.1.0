import { Subject } from 'rxjs';

import { deleteUndefined, ERROR, ErrorList, R, t, Uri, value as valueUtil } from '../../common';
import { TypeCache } from '../TypeCache';
import { TypeDefault } from '../TypeDefault';
import { TypeValue } from '../TypeValue';
import * as valdiate from './TypeClient.fn.validate';
import { TypeProp } from '../TypeProp';

type Visit = { ns: string; level: number };
type Context = {
  fetch: t.ISheetFetcher;
  errors: ErrorList;
  visited: Visit[];
  cache: t.IMemoryCache;
};

type LoadResponse = {
  ok: boolean;
  defs: t.INsTypeDef[];
  errors: t.ITypeError[];
};

const toCacheKey = (uri: string, ...path: string[]) => {
  const suffix = path.length === 0 ? '' : `/${path.join('/')}`;
  return `TypeClient/${uri.toString()}${suffix}`;
};

/**
 * Load a type-definition from the network.
 */
export async function load(args: {
  ns: string | t.INsUri;
  fetch: t.ISheetFetcher;
  cache?: t.IMemoryCache;
}): Promise<LoadResponse> {
  const ns = Uri.ns(args.ns, false).toString();

  // Check cache (if an external cache was provided).
  if (args.cache) {
    const key = toCacheKey(ns);
    const value = args.cache.get(key);
    if (value instanceof Subject) {
      // NB: The load operation for the namespace currently in progress.
      //     Wait for the first request to complete.
      return value.toPromise();
    } else if (typeof value === 'object') {
      // NB: Namespace already loaded within the cache.
      return value as any;
    }
  }

  const cache = TypeCache.toCache(args.cache);
  const fetch = TypeCache.fetch(args.fetch, { cache });
  const errors = ErrorList.create({ defaultType: ERROR.TYPE.DEF });
  const ctx: Context = { fetch, cache, errors, visited: [] };

  return loadNamespace({ ns, ctx, level: 0 });
}

/**
 * [INTERNAL]
 */

function groupByTypename(columns: t.IColumnTypeDef[]) {
  const ERROR_KEY = '___ERROR___';
  const groups = R.groupBy(def => {
    const res = TypeProp.parse(def);
    return res.error ? ERROR_KEY : res.type;
  }, columns);
  delete groups[ERROR_KEY]; // NB: errors trimmed off.
  Object.keys(groups).forEach(typename => {
    groups[typename].forEach(item => {
      item.prop = item.prop.substring(typename.length + 1);
    });
  });
  return groups;
}

function toNsTypeDef(args: {
  ns: string;
  typename: string;
  columns: t.IColumnTypeDef[];
  errors: ErrorList;
}) {
  const { ns, typename, columns, errors } = args;

  let typeDef: t.INsTypeDef = {
    ok: errors.ok,
    uri: ns,
    typename,
    columns,
    errors: [],
  };

  // Validate.
  valdiate.ns({ ns, typeDef, errors });

  // Prepare final error list.
  const columnErrors = columns.reduce(
    (acc, { error }) => (error ? [...acc, error] : acc),
    [] as t.ITypeError[],
  );
  const errs = R.uniq([...errors.list, ...columnErrors]);
  const ok = errs.length === 0;
  typeDef = { ...typeDef, ok, errors: errs };

  // Finish up.
  return typeDef;
}

/**
 * Loads the given namespace.
 */
async function loadNamespace(args: {
  level: number;
  ns: string;
  ctx: Context;
}): Promise<LoadResponse> {
  const { level, ctx } = args;
  const { visited, cache, fetch, errors } = ctx;
  const ns = Uri.ns(args.ns, false).toString();

  // Cache.
  const cacheKey = toCacheKey(ns);
  const loading$ = new Subject<LoadResponse>();
  cache.put(cacheKey, loading$);
  loading$.subscribe(response => cache.put(cacheKey, response));

  // Prepare return object.
  const done = (args: { columns?: t.IColumnTypeDef[] } = {}): LoadResponse => {
    const { columns = [] } = args;
    const groups = groupByTypename(columns);
    const defs = Object.keys(groups)
      .map(typename => ({ typename, columns: groups[typename] }))
      .map(({ typename, columns }) => toNsTypeDef({ ns, typename, columns, errors }));

    const ok = errors.ok && defs.every(def => def.ok);
    let errs: t.ITypeError[] | undefined;

    const res: LoadResponse = {
      ok,
      defs,
      get errors() {
        if (!ok && !errs) {
          errs = R.uniq([
            ...errors.list,
            ...defs.reduce((acc, def) => [...acc, ...def.errors], [] as t.ITypeError[]),
          ]);
        }
        return ok ? [] : (errs as t.ITypeError[]);
      },
    };

    loading$.next(res);
    loading$.complete();
    return res;
  };

  // Validate the URI.
  Uri.ns(ns, uri => {
    if (uri.error) {
      const message = `Invalid namespace (${args.ns}). ${uri.error.message}`;
      errors.add(ns, message);
    }
  });

  if (!errors.ok) {
    return done();
  }

  try {
    // Retrieve namespace.
    const fetchedNs = await fetch.getNs({ ns });
    if (fetchedNs.error) {
      const error = fetchedNs.error;
      const errorType = error.status === 404 ? ERROR.TYPE.NOT_FOUND : ERROR.TYPE.DEF;
      errors.add(ns, fetchedNs.error.message, { errorType });
      return done();
    }
    if (!fetchedNs.ns) {
      const message = `The namespace (${ns}) does not exist`;
      errors.add(ns, message, { errorType: ERROR.TYPE.NOT_FOUND });
      return done();
    }
    if (fetchedNs.ns.type?.implements === ns) {
      const message = `The namespace (${ns}) cannot implement itself (circular-ref)`;
      errors.add(ns, message, { errorType: ERROR.TYPE.REF_CIRCULAR });
      return done();
    }

    // Retrieve columns.
    const fetchedColumns = await fetch.getColumns({ ns });
    if (fetchedColumns.error) {
      errors.add(ns, fetchedColumns.error.message);
      return done();
    }
    const columns = fetchedColumns.columns || {};

    // Check for any self-references.
    const selfRefs = getSelfRefs({ ns, columns });
    if (selfRefs.length > 0) {
      const keys = selfRefs.map(item => item.key);
      const message = `The namespace (${ns}) directly references itself in column [${keys}] (circular-ref)`;
      errors.add(ns, message, { errorType: ERROR.TYPE.REF_CIRCULAR });
      return done();
    }

    // Read in type details for each column.
    visited.push({ ns, level });
    return done({
      columns: await readColumns({ level, ns, ctx, columns }),
    });
  } catch (error) {
    // Fail.
    errors.add(ns, `Failed while loading type for "${ns}". ${error.message}`);
    return done();
  }
}

function isCircularRef(args: { level: number; ns: string; ctx: Context }) {
  const { level, ns, ctx } = args;
  const { visited, errors } = ctx;

  const isCircular = visited.some(visit => visit.ns === ns && visit.level < level);
  if (isCircular) {
    const path = visited.map(visit => `${visit.ns}`).join(' ➔ ');
    const message = `The namespace "${ns}" leads back to itself (circular reference). Sequence: ${path}`;
    errors.add(ns, message, { errorType: ERROR.TYPE.REF_CIRCULAR });
  }
  return isCircular;
}

/**
 * Read and parse type definitions for the given columns.
 */
async function readColumns(args: {
  level: number;
  ns: string;
  columns: t.IColumnMap;
  ctx: Context;
}): Promise<t.IColumnTypeDef[]> {
  const { ns, level, ctx } = args;
  const { errors } = ctx;

  // Short-circuit any circular references.
  if (isCircularRef({ level, ns, ctx })) {
    return [];
  }

  // Read column data.
  const list = flattenColumnTypeDefs(args.columns);
  const wait = list.map(({ column, def }) => readColumn({ level, ns, column, def, ctx }));
  const columns = R.sortBy(R.prop('column'), await Promise.all(wait));

  // Finish up.
  valdiate.columns({ ns, columns, errors });
  return columns;
}

async function readColumn(args: {
  level: number;
  ns: string;
  column: string;
  def: t.CellTypeDef;
  ctx: Context;
}): Promise<t.IColumnTypeDef> {
  const { ns, column, level, ctx } = args;
  const target = args.def.target;
  let type = deleteUndefined(TypeValue.parse(args.def.type).type);
  let error: t.ITypeError | undefined;

  let prop = (args.def.prop || '').trim();
  const optional = prop.endsWith('?') ? true : undefined;
  prop = optional ? prop.replace(/\?$/, '') : prop;

  let defaultValue = args.def.default;

  if (type.kind === 'REF') {
    const res = await readRef({ level, ns, column, ref: type, ctx });
    type = res.type;
    error = res.error ? res.error : error;
    defaultValue = defaultValue === undefined ? res.default : defaultValue; // NB: Use the closest default value to the declaration. Import from REF is not declared locally.
  }

  if (type.kind === 'UNION') {
    const union = type;
    await readUnionRefs({ level, ns, column, union, ctx });
  }

  if (type.kind === 'UNION') {
    const union = type;
    union.typename = TypeValue.toTypename(union);
  }

  const def: t.IColumnTypeDef = {
    column,
    prop,
    optional,
    type,
    target,
    default: await toDefaultDef({ default: defaultValue, ctx }),
    error,
  };
  return valueUtil.deleteUndefined(def);
}

async function toDefaultDef(args: {
  default: t.CellTypeDef['default'];
  ctx: Context;
}): Promise<t.ITypeDefault | undefined> {
  const { ctx } = args;

  const done = (result: t.ITypeDefault) => {
    return R.equals(result, { value: undefined }) ? undefined : result;
  };

  if (TypeDefault.isTypeDefaultRef(args.default)) {
    const { fetch } = ctx;
    const def = args.default as t.ITypeDefaultRef;
    const ref = await TypeDefault.toRefValue({ def, fetch });
    const value = ref.value as t.TypeDefaultValue;
    const res: t.ITypeDefaultValue = { value };
    return done(res);
  } else {
    return done(TypeDefault.toTypeDefault(args.default));
  }
}

/**
 * Recursively walk a union, loading any REFs.
 */
async function readUnionRefs(args: {
  level: number;
  ns: string;
  column: string;
  union: t.ITypeUnion;
  ctx: Context;
}) {
  const { level, ns, column, union, ctx } = args;

  let index = 0;
  for (const type of union.types) {
    if (type.kind === 'REF') {
      const res = await readRef({ level, ns, column, ref: type, ctx });
      Object.keys(res.type).forEach(key => (type[key] = res.type[key])); // NB: Copy all values onto the union child.
    }

    if (type.kind === 'UNION') {
      await readUnionRefs({ level: level + 1, ns, column, union: type, ctx }); // <== 🌳RECURSION
    }

    index++;
  }
}

/**
 * Populate a type REF from the network.
 */
async function readRef(args: {
  level: number;
  ns: string;
  column: string;
  ref: t.ITypeRef;
  ctx: Context;
}): Promise<{ type: t.IType; default?: t.ITypeDef['default']; error?: t.ITypeError }> {
  const { ns, column, ref, level, ctx } = args;

  const isColumn = Uri.is.column(ref.uri);
  const columnUri = isColumn ? Uri.column(ref.uri) : undefined;
  const nsUri = columnUri ? Uri.create.ns(columnUri.ns) : ref.uri;
  const unknown: t.ITypeUnknown = { kind: 'UNKNOWN', typename: nsUri };

  if (!Uri.is.ns(nsUri)) {
    const msg = `The referenced type in column '${column}' is not a namespace`;
    ctx.errors.add(ns, msg, { column, errorType: ERROR.TYPE.REF });
    return { type: unknown };
  }

  if (!ref.typename) {
    const msg = `The reference '${ref.uri}' in column '${column}' of (${ns}) does not contain a typename. Should be <uri/typename>`;
    return {
      type: unknown,
      error: ctx.errors.add(ns, msg, { column, errorType: ERROR.TYPE.REF_TYPENAME }),
    };
  }

  // Retrieve the referenced namespace.
  const loaded = await loadNamespace({
    level: level + 1,
    ns: nsUri,
    ctx,
  }); // <== RECURSION 🌳

  // Check for errors.
  if (!loaded.ok) {
    const msg = `Failed to load referenced type in column '${column}' (${nsUri})`;
    const children = loaded.errors;
    return {
      type: unknown,
      error: ctx.errors.add(ns, msg, { column, children, errorType: ERROR.TYPE.REF }),
    };
  }

  // Retrieve the definition.
  const def = loaded.defs.find(def => def.typename === ref.typename);
  if (!def) {
    const msg = `The referenced typename '${ref.typename}' in column '${column}' was not found in the types retrieved from (${nsUri})`;
    return {
      type: unknown,
      error: ctx.errors.add(ns, msg, { column, errorType: ERROR.TYPE.NOT_FOUND }),
    };
  }

  // Build the REF object.
  if (columnUri) {
    // Column REF.
    const columnDef = def.columns.find(item => item.column === columnUri.key);
    if (!columnDef) {
      const msg = `The referenced column '${column}' of type '${ref.typename}' does not exist in the retrieved namespace (${nsUri})`;
      return {
        type: unknown,
        error: ctx.errors.add(ns, msg, { errorType: ERROR.TYPE.NOT_FOUND }),
      };
    }

    return {
      type: columnDef.type,
      default: columnDef.default,
    };
  } else {
    // Namespace REF.
    const { typename } = def;
    const types: t.ITypeDef[] = def.columns.map(item => {
      const { prop, type, optional } = item;
      return {
        prop,
        type,
        optional,
        default: item.default,
      };
    });

    const type: t.ITypeRef = { ...ref, typename, types };
    return { type };
  }
}

/**
 * Examine a set of columns looking for any columns that REF themselves.
 *
 *    columns: {
 *      A: { props: { def: { name: 'A', type: 'ns:foo' } } },     <== Not OK (self, ns)
 *      B: { props: { def: { name: 'B', type: 'cell:foo!A' } } }, <== Not OK (self, different column)
 *      C: { props: { def: { name: 'C', type: 'cell:foo!C' } } }, <== Not OK (self, column)
 *    },
 *
 */
const getSelfRefs = (args: { ns: string; columns: t.IColumnMap }) => {
  const { columns } = args;
  const ns = Uri.ns(args.ns);
  return flattenColumnTypeDefs(columns)
    .map(e => ({
      key: e.column,
      type: e.def.type as string,
    }))
    .filter(e => Boolean(e.type))
    .filter(e => Uri.is.uri(e.type))
    .map(e => ({ ...e, uri: Uri.parse(e.type) }))
    .map(e => ({ ...e, kind: e.uri.parts.type }))
    .filter(({ type, uri }) => {
      if (type === ns.toString()) {
        return true; // Self referencing NAMESPACE.
      }
      if (uri.parts.type === 'COLUMN' && uri.parts.ns === ns.id) {
        return true; // Self referencing COLUMN.
      }
      return false;
    });
};

/**
 * Produces a list of column type-defs flattening any 'def' fields defined
 * as an array into distinct list items.
 */
function flattenColumnTypeDefs(columns: t.IColumnMap) {
  type D = { column: string; def: t.CellTypeDef };
  return Object.keys(columns).reduce((acc, column) => {
    const def = columns[column]?.props?.def;
    if (def) {
      const defs = Array.isArray(def) ? def : [def];
      defs.forEach(def => acc.push({ column, def }));
    }
    return acc;
  }, [] as D[]);
}

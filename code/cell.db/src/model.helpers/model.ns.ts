import { coord, Schema, t, Uri, util, R } from '../common';
import { Cell, Column, Row } from '../model.db';
import { toChanges } from './util';

const { squash, isNilOrEmptyObject } = util.value;

/**
 * Render the model into a simple [t.INS] object.
 */
export async function toObject(model: t.IDbModelNs) {
  const id = toId(model);
  const res: t.INs = {
    id,
    hash: '-', // Default (if does not exist, otherwise should be on the DB data object).
    ...squash.object(model.toObject()),
  };
  return res;
}

/**
 * Retrieve the ID of the given Namespace model or URI or DB path.
 */
export function toId(input: t.IDbModelNs | string) {
  if (typeof input === 'string' && !(input.includes(':') || input.includes('/'))) {
    return input;
  } else {
    return toSchema(input).parts.id;
  }
}

/**
 * Retrieve the URI of the given Namespace model or URI or DB path.
 */
export function toSchema(input: t.IDbModelNs | string) {
  if (typeof input === 'string' && !(input.includes(':') || input.includes('/'))) {
    input = `ns:${input.trim()}`;
  }
  return Schema.from.ns(typeof input === 'string' ? input : input.path);
}

/**
 * Get the child [Cells] of the given namespace.
 */
export async function getChildCells(args: { model: t.IDbModelNs; range?: string }) {
  const models = await args.model.children.cells;
  const union = toRangeUnion(args.range);
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.cell(next);
    if (includeKey(parts.key, union)) {
      acc[parts.key] = squash.cell(next.toObject());
    }
    return acc;
  }, {}) as t.ICellMap;
}

/**
 * Get the child [Rows] of the given namespace.
 */
export async function getChildRows(args: { model: t.IDbModelNs; range?: string }) {
  const models = await args.model.children.rows;
  const union = toRangeUnion(args.range);
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.row(next);
    if (includeKey(parts.key, union)) {
      acc[parts.key] = squash.object(next.toObject());
    }
    return acc;
  }, {}) as t.ICellMap;
}

/**
 * Get the child [Columns] of the given namespace.
 */
export async function getChildColumns(args: { model: t.IDbModelNs; range?: string }) {
  const models = await args.model.children.columns;
  const union = toRangeUnion(args.range);
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.column(next);
    if (includeKey(parts.key, union)) {
      acc[parts.key] = squash.object(next.toObject());
    }
    return acc;
  }, {}) as t.ICellMap;
}

/**
 * Retrieve child file data.
 */
export async function getChildFiles(args: { model: t.IDbModelNs }) {
  const models = await args.model.children.files;
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.file(next);
    acc[parts.file] = squash.object(next.toObject());
    return acc;
  }, {}) as t.IFileMap;
}

/**
 * Retrieve child data.
 */
export async function getChildData(args: {
  model: t.IDbModelNs;
  cells?: boolean | string; // true: <all> | string: key or range, eg "A1", "A1:C10"
  rows?: boolean | string;
  columns?: boolean | string;
  files?: boolean;
  totals?: boolean | t.NsTotalKey[];
}) {
  const { model } = args;

  const toTotalsFlags = (totals?: boolean | t.NsTotalKey[]): t.NsTotalKey[] => {
    if (totals === true) {
      return ['cells', 'rows', 'columns', 'files'];
    }
    if (Array.isArray(totals)) {
      if (totals.includes('rows') || totals.includes('columns')) {
        return R.uniq([...totals, 'cells']);
      } else {
        return totals;
      }
    }
    return [];
  };
  const totalsFlags = toTotalsFlags(args.totals);

  // Retrieve data.
  const wait = [
    { field: 'cells', fn: getChildCells },
    { field: 'rows', fn: getChildRows },
    { field: 'columns', fn: getChildColumns },
    { field: 'files', fn: getChildFiles },
  ]
    .filter(item => {
      const field = item.field as t.NsTotalKey;
      return Boolean(args[field]) || totalsFlags.includes(field);
    })
    .map(async ({ field, fn }) => {
      const type = typeof args[field];
      const range = type === 'string' || type === 'number' ? args[field].toString() : undefined;
      const value = await fn({ model, range });
      return { field, value };
    });

  const data = (await Promise.all(wait)).reduce((acc, next) => {
    acc[next.field] = next.value;
    return acc;
  }, {}) as t.INsDataChildren;

  // Calculate totals.
  const totals: Partial<t.INsTotals> = {};
  const appendTotal = (field: t.NsTotalKey) => {
    if (!totalsFlags.includes(field)) {
      return;
    }
    if (data.files && field === 'files') {
      totals.files = Object.keys(data.files).length;
    }
    if (data.cells) {
      const keys = Object.keys(data.cells);
      if (field === 'cells') {
        totals.cells = keys.length;
      }
      if (field === 'rows') {
        totals.rows = coord.cell.max.row(keys) + 1;
      }
      if (field === 'columns') {
        totals.columns = coord.cell.max.column(keys) + 1;
      }
    }
  };
  appendTotal('cells');
  appendTotal('rows');
  appendTotal('columns');
  appendTotal('files');

  // Prune off any data-fields that were not asked for.
  // NB: These may have been added if the total of the type was requested.
  Object.keys(data)
    .filter(field => !Boolean(args[field]))
    .forEach(field => delete data[field]);

  // Finish up.
  return { data, totals };
}

/**
 * Update the Namespace props.
 */
export async function setProps<P extends t.INsProps = t.INsProps>(args: {
  ns: t.IDbModelNs;
  data?: Partial<P>;
}) {
  const { ns, data } = args;
  let changes: t.IDbModelChange[] = [];

  if (isNilOrEmptyObject(data, { ignoreHash: true })) {
    return { changes, isChanged: false };
  }

  const uri = toSchema(ns).uri;
  const props = { ...(ns.props.props || {}), ...data };
  const res = await ns.set({ props }).save();

  // Finish up.
  changes = toChanges(uri, res.changes);
  const isChanged = changes.length > 0;
  return { changes, isChanged };
}

/**
 * Save child data (cells|rows|columns).
 */
export async function setChildData(args: { ns: t.IDbModelNs; data?: Partial<t.INsDataCoord> }) {
  const { ns } = args;
  let changes: t.IDbModelChange[] = [];
  const saved = { cells: 0, rows: 0, columns: 0 };

  if (!args.data) {
    return { isChanged: false, saved, changes };
  }

  const wait = [
    { field: 'cells', fn: setChildCells },
    { field: 'rows', fn: setChildRows },
    { field: 'columns', fn: setChildColumns },
  ].map(async ({ field, fn }) => {
    const data = args.data ? args.data[field] : undefined;
    if (data) {
      const res = await fn({ ns, data });
      changes = [...changes, ...res.changes];
      saved[field] += res.total;
    }
  });
  await Promise.all(wait);

  const isChanged = changes.length > 0;
  return { isChanged, saved, changes };
}

/**
 * Saves child cell data.
 */
export async function setChildCells(args: { ns: t.IDbModelNs; data?: t.IMap<t.ICellData> }) {
  const { data } = args;
  const id = toId(args.ns);
  const db = args.ns.db;
  const getUri = (key: string) => Uri.create.cell(id, key);
  return setChildren({
    data,
    getUri,
    getModel: key => Cell.create({ db, uri: getUri(key) }),
  });
}

/**
 * Saves child row data.
 */
export async function setChildRows(args: { ns: t.IDbModelNs; data?: t.IMap<t.IRowData> }) {
  const { data } = args;
  const id = toId(args.ns);
  const db = args.ns.db;
  const getUri = (key: string) => Uri.create.row(id, key);
  return setChildren({
    data,
    getUri,
    getModel: key => Row.create({ db, uri: getUri(key) }),
  });
}

/**
 * Saves child column data.
 */
export async function setChildColumns(args: { ns: t.IDbModelNs; data?: t.IMap<t.IColumnData> }) {
  const { data } = args;
  const id = toId(args.ns);
  const db = args.ns.db;
  const getUri = (key: string) => Uri.create.column(id, key);
  return setChildren({
    data,
    getUri,
    getModel: key => Column.create({ db, uri: getUri(key) }),
  });
}

/**
 * [Helpers]
 */
function toRangeUnion(input?: string) {
  if (!input) {
    return undefined;
  }
  const ranges = input.split(',').map(key => (key.includes(':') ? key : `${key}:${key}`));
  return coord.range.union(ranges);
}

function includeKey(key: string, union?: coord.range.CellRangeUnion) {
  return union ? union.contains(key) : true;
}

async function setChildren(args: {
  data: t.IMap<object> | undefined;
  getUri: (key: string) => string;
  getModel: (key: string) => t.IModel;
}) {
  const { data } = args;
  let total = 0;
  let changes: t.IDbModelChange[] = [];

  if (!data) {
    return { total, changes, isChanged: changes.length > 0 };
  }

  const wait = Object.keys(data).map(async key => {
    const props = data[key];
    if (typeof props === 'object') {
      const model = (await args.getModel(key).ready).set(props);
      if (model.isChanged) {
        total++;
        const res = await model.save();
        const uri = args.getUri(key);
        changes = [...changes, ...toChanges(uri, res.changes)];
      }
    }
  });

  await Promise.all(wait);

  return { total, changes, isChanged: changes.length > 0 };
}

import { t, Schema, Uri, util, coord } from '../common';
import { Cell, Column, Row } from '../model.db';

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
 * Get the child [cells] of the given namespace.
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
 * Get the child [rows] of the given namespace.
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
 * Get the child [columns] of the given namespace.
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
 * Retrieve the child data.
 */
export async function getChildData(args: {
  model: t.IDbModelNs;
  cells?: boolean | string; // true: <all> | string: key or range, eg "A1", "A1:C10"
  rows?: boolean | string;
  columns?: boolean | string;
}) {
  const { model } = args;
  const wait = [
    { field: 'cells', fn: getChildCells },
    { field: 'rows', fn: getChildRows },
    { field: 'columns', fn: getChildColumns },
  ]
    .filter(item => Boolean(args[item.field]))
    .map(async ({ field, fn }) => {
      const type = typeof args[field];
      const range = type === 'string' || type === 'number' ? args[field].toString() : undefined;
      return {
        field,
        value: await fn({ model, range }),
      };
    });

  return (await Promise.all(wait)).reduce((acc, next) => {
    acc[next.field] = next.value;
    return acc;
  }, {}) as t.INsCoordData;
}

/**
 * Update the Namespace props.
 */
export async function setProps(args: { ns: t.IDbModelNs; data?: Partial<t.INsProps> }) {
  const { ns, data } = args;

  if (isNilOrEmptyObject(data, { ignoreHash: true })) {
    return { changes: [] };
  }

  const uri = toSchema(ns).uri;
  const props = { ...(ns.props.props || {}), ...data };
  const res = await ns.set({ props }).save();

  // Finish up.
  const changes = util.toDbModelChanges(uri, res.changes);
  return { changes };
}

/**
 * Save child data (cells|rows|columns).
 */
export async function setChildData(args: { ns: t.IDbModelNs; data?: Partial<t.INsCoordData> }) {
  const { ns } = args;
  const saved = { cells: 0, rows: 0, columns: 0 };
  if (!args.data) {
    return { isChanged: false, saved };
  }

  const wait = [
    { field: 'cells', fn: setChildCells },
    { field: 'rows', fn: setChildRows },
    { field: 'columns', fn: setChildColumns },
  ].map(async ({ field, fn }) => {
    const data = args.data ? args.data[field] : undefined;
    if (data) {
      const res = await fn({ ns, data });
      saved[field] += res.saved;
    }
  });
  await Promise.all(wait);

  const isChanged = saved.cells > 0 || saved.columns > 0 || saved.rows > 0;
  return { isChanged, saved };
}

/**
 * Saves child cell data.
 */
export async function setChildCells(args: { ns: t.IDbModelNs; data?: t.IMap<t.ICellData> }) {
  const { data } = args;
  const id = toId(args.ns);
  const db = args.ns.db;
  return setChildren({
    data: data,
    getModel: key => Cell.create({ db, uri: Uri.string.cell(id, key) }),
  });
}

/**
 * Saves child row data.
 */
export async function setChildRows(args: { ns: t.IDbModelNs; data?: t.IMap<t.IRowData> }) {
  const { data } = args;
  const id = toId(args.ns);
  const db = args.ns.db;
  return setChildren({
    data: data,
    getModel: key => Row.create({ db, uri: Uri.string.row(id, key) }),
  });
}

/**
 * Saves child column data.
 */
export async function setChildColumns(args: { ns: t.IDbModelNs; data?: t.IMap<t.IColumnData> }) {
  const { data } = args;
  const id = toId(args.ns);
  const db = args.ns.db;
  return setChildren({
    data: data,
    getModel: key => Column.create({ db, uri: Uri.string.column(id, key) }),
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
  getModel: (key: string) => t.IModel;
}) {
  const { data } = args;
  let saved = 0;

  if (!data) {
    return { saved };
  }

  const wait = Object.keys(data).map(async key => {
    const props = data[key];
    if (typeof props === 'object') {
      const model = (await args.getModel(key).ready).set(props);
      if (model.isChanged) {
        saved++;
        await model.save();
      }
    }
  });

  await Promise.all(wait);
  return { saved };
}

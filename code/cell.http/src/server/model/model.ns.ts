import { cell, t } from '../common';

const { Schema, Uri, model } = cell;
const squash = cell.value.squash;
const { Cell, Row, Column } = model.db;

/**
 * Get the child [cells] of the given namespace.
 */
export const getChildCells = async (args: { model: t.IDbModelNs; range?: string }) => {
  const models = await args.model.children.cells;
  const union = toRangeUnion(args.range);
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.cell(next);
    if (includeKey(parts.key, union)) {
      acc[parts.key] = squash.cell(next.toObject());
    }
    return acc;
  }, {}) as t.ICellMap;
};

/**
 * Get the child [rows] of the given namespace.
 */
export const getChildRows = async (args: { model: t.IDbModelNs; range?: string }) => {
  const models = await args.model.children.rows;
  const union = toRangeUnion(args.range);
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.row(next);
    if (includeKey(parts.key, union)) {
      acc[parts.key] = squash.object(next.toObject());
    }
    return acc;
  }, {}) as t.ICellMap;
};

/**
 * Get the child [columns] of the given namespace.
 */
export const getChildColumns = async (args: { model: t.IDbModelNs; range?: string }) => {
  const models = await args.model.children.columns;
  const union = toRangeUnion(args.range);
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.column(next);
    if (includeKey(parts.key, union)) {
      acc[parts.key] = squash.object(next.toObject());
    }
    return acc;
  }, {}) as t.ICellMap;
};

/**
 * Retrieve the child data.
 */
export const getChildData = async (
  model: t.IDbModelNs,
  options: {
    cells?: boolean | string; // true: <all> | string: key or range, eg "A1", "A1:C10"
    rows?: boolean | string;
    columns?: boolean | string;
  } = {},
) => {
  const wait = [
    { field: 'cells', fn: getChildCells },
    { field: 'rows', fn: getChildRows },
    { field: 'columns', fn: getChildColumns },
  ]
    .filter(item => Boolean(options[item.field]))
    .map(async ({ field, fn }) => {
      const type = typeof options[field];
      const range = type === 'string' || type === 'number' ? options[field].toString() : undefined;
      return {
        field,
        value: await fn({ model, range }),
      };
    });

  return (await Promise.all(wait)).reduce((acc, next) => {
    acc[next.field] = next.value;
    return acc;
  }, {}) as t.INsCoordData;
};

/**
 * Saves child cell data.
 */
export async function setChildCells(args: { db: t.IDb; id: string; data?: t.IMap<t.ICellData> }) {
  const { db, id, data } = args;
  return setChildren({
    data: data,
    getModel: key => Cell.create({ db, uri: Uri.string.cell(id, key) }),
  });
}

/**
 * Saves child row data.
 */
export async function setChildRows(args: { db: t.IDb; id: string; data?: t.IMap<t.IRowData> }) {
  const { db, id, data } = args;
  return setChildren({
    data: data,
    getModel: key => Row.create({ db, uri: Uri.string.row(id, key) }),
  });
}

/**
 * Saves child column data.
 */
export async function setChildColumns(args: {
  db: t.IDb;
  id: string;
  data?: t.IMap<t.IColumnData>;
}) {
  const { db, id, data } = args;
  return setChildren({
    data: data,
    getModel: key => Column.create({ db, uri: Uri.string.column(id, key) }),
  });
}

/**
 * Save child data (cells|rows|columns).
 */
export async function setChildData(args: {
  db: t.IDb;
  id: string;
  data?: Partial<t.INsCoordData>;
}) {
  const { db, id } = args;
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
      const res = await fn({ db, id, data });
      saved[field] += res.saved;
    }
  });
  await Promise.all(wait);

  const isChanged = saved.cells > 0 || saved.columns > 0 || saved.rows > 0;
  return { isChanged, saved };
}

/**
 * [Helpers]
 */
function toRangeUnion(input?: string) {
  if (!input) {
    return undefined;
  }
  const ranges = input.split(',').map(key => (key.includes(':') ? key : `${key}:${key}`));
  return cell.coord.range.union(ranges);
}

function includeKey(key: string, union?: cell.coord.range.CellRangeUnion) {
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

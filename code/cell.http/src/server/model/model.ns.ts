import { cell, t } from '../common';

const { Schema } = cell;
const squash = cell.value.squash;

/**
 * Get the child [cells] of the given namespace.
 */
export const getChildCells = async (model: t.IDbModelNs) => {
  const models = await model.children.cells;
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.cell(next);
    acc[parts.key] = squash.cell(next.toObject());
    return acc;
  }, {}) as t.ICellMap;
};

/**
 * Get the child [rows] of the given namespace.
 */
export const getChildRows = async (model: t.IDbModelNs) => {
  const models = await model.children.rows;
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.row(next);
    acc[parts.key] = squash.object(next.toObject());
    return acc;
  }, {}) as t.ICellMap;
};

/**
 * Get the child [columns] of the given namespace.
 */
export const getChildColumns = async (model: t.IDbModelNs) => {
  const models = await model.children.columns;
  return models.reduce((acc, next) => {
    const { parts } = Schema.from.column(next);
    acc[parts.key] = squash.object(next.toObject());
    return acc;
  }, {}) as t.ICellMap;
};

/**
 * Retrieve the child data.
 */
export const childData = async (model: t.IDbModelNs) => {
  const wait = [
    { field: 'cells', method: getChildCells },
    { field: 'rows', method: getChildRows },
    { field: 'columns', method: getChildColumns },
  ].map(async ({ field, method }) => ({ field, value: await method(model) }));

  return (await Promise.all(wait)).reduce((acc, next) => {
    acc[next.field] = next.value;
    return acc;
  }, {}) as t.INsCoordData;
};

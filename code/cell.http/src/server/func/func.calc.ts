import { t, cell, models } from '../common';

/**
 * Executes calculations on a namespace.
 */
export function calc(args: { ns: t.IDbModelNs; cells: t.IMap<t.ICellData> }) {
  const { ns } = args;

  /**
   * TODO 🐷
   * - lookup functions from imports (TDB, external namespaces)
   */
  const getFunc: t.GetFunc = async () => undefined; // TEMP 🐷

  /**
   * Cells lookup.
   */
  let cells: t.IMap<t.ICellData> | undefined;
  const getCells: t.GetCells = async () => {
    cells = cells || (await models.ns.getChildCells({ model: ns }));
    return { ...cells, ...(args.cells || {}) };
  };

  /**
   * References table manager.
   */
  const refsTable = cell.coord.refs.table({
    getKeys: async () => Object.keys(await getCells()),
    getValue: async key => {
      const cell = (await getCells())[key];
      return cell && typeof cell.value === 'string' ? cell.value : undefined;
    },
  });
  const table = cell.func.table({ getCells, getFunc, refsTable });

  /**
   * Calculate a set of changes.
   */
  const changes = async (options: { range?: string } = {}) => {
    // Determine the set of keys to evalutate.
    let cellKeys = Object.keys(args.cells || {});
    if (typeof options.range === 'string') {
      const ranges = cell.coord.range.union(options.range.split(','));
      cellKeys = cellKeys.filter(key => ranges.contains(key));
    }

    // Calculate the changes.
    return table.calculate({ cells: cellKeys });
  };

  // Finish up.
  return { changes, table };
}

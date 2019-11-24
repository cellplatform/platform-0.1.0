import { t, cell } from '../common';

/**
 * Executes calculations on a namespace.
 */
export function calc(args: { getCells: t.GetCells }) {
  const { getCells } = args;

  /**
   * TODO 🐷
   * - lookup functions from imports (TDB, external namespaces)
   */
  const getFunc: t.GetFunc = async () => undefined; // TEMP 🐷

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
  const changes = async (args: { cells?: string | string[] }) => {
    const { cells } = args;
    const res = await table.calculate({ cells });
    return res;
  };

  // Finish up.
  return { changes, table };
}

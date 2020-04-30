import { TypeSystem } from '..';
import { coord, t } from '../common';

type M = 'getNs' | 'getColumns' | 'getCells';

/**
 * Generate a stub data [fetch] object using the provided
 * type-defs and cells object as source data.
 *
 * NOTE:
 *    This by-passes talking to the HTTP=>DB systems and
 *    thereby allows tests of the TypeSystem to run in a
 *    decoupled manner.
 */
export const testFetch = (data: {
  defs: { [ns: string]: t.ITypeDefPayload };
  cells?: t.ICellMap;
  before?: (args: { method: M; args: any }) => void;
}) => {
  const before = (method: M, args: any) => {
    if (data.before) {
      data.before({ method, args });
    }
  };

  const getNs: t.FetchSheetNs = async args => {
    before('getNs', args);
    const def = data.defs[args.ns];
    const ns = !def ? undefined : ((def.ns || {}) as t.INsProps);
    res.getNsCount++;
    return { ns };
  };

  const getColumns: t.FetchSheetColumns = async args => {
    before('getColumns', args);
    const def = data.defs[args.ns];
    const columns = def?.columns;
    res.getColumnsCount++;
    return { columns };
  };

  const getCells: t.FetchSheetCells = async args => {
    before('getCells', args);
    const cells = data.cells;
    const rows = coord.cell.max.row(Object.keys(cells || {})) + 1;
    const total = { rows };
    res.getCellsCount++;
    return { cells, total };
  };

  type T = t.ISheetFetcher & {
    getNsCount: number;
    getColumnsCount: number;
    getCellsCount: number;
    data: { cells?: t.ICellMap };
  };

  const res: T = {
    ...TypeSystem.fetcher.fromFuncs({ getNs, getColumns, getCells }),
    getNsCount: 0,
    getColumnsCount: 0,
    getCellsCount: 0,
    data: { cells: data.cells },
  };

  return res;
};

/**
 * Generate a stub data [fetch] object, to operate against an:
 *  - instance (sheet)
 *  - type-def (sheet)
 */
export const testInstanceFetch = async <T>(args: {
  instance: string;
  implements: string;
  defs: { [ns: string]: t.ITypeDefPayload };
  rows?: T[];
  cells?: t.ICellMap;
  cache?: t.IMemoryCache;
}) => {
  const loaded = await TypeSystem.Client.load({
    ns: args.implements,
    fetch: testFetch({ defs: args.defs }),
    cache: args.cache,
  });

  const typeDef = loaded.defs[0]; // TEMP 🐷

  const cells = {
    ...(args.cells || {}),
    ...TypeSystem.objectToCells<T>(typeDef).rows(0, args.rows || []),
  };

  const def: t.ITypeDefPayload = {
    ns: { type: { implements: args.implements } },
    columns: {},
  };

  return testFetch({
    cells,
    defs: { ...args.defs, [args.instance]: def },
  });
};

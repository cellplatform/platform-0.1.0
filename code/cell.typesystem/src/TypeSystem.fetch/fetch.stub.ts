import { t, coord } from '../common';
import { fromFuncs } from './fetch.fromFuncs';
import { objectToCells } from '../util';
import { TypeClient } from '../TypeSystem.core/TypeClient';

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
const fetch = (data: {
  defs: { [ns: string]: t.ITypeDefPayload };
  cells?: t.ICellMap;
  before?: (args: { method: M; args: any }) => void;
}) => {
  const before = (method: M, args: any) => {
    if (data.before) {
      data.before({ method, args });
    }
  };

  const filterCells = (query: string, cells: t.ICellMap) => {
    const range = coord.range.fromKey(query);
    return Object.keys(cells).reduce((acc, next) => {
      if (range.contains(next)) {
        acc[next] = cells[next];
      }
      return acc;
    }, {});
  };

  const getNs: t.FetchSheetNs = async (args) => {
    before('getNs', args);
    const def = data.defs[args.ns];
    const ns = !def ? undefined : ((def.ns || {}) as t.INsProps);
    res.getNsCount++;
    return { ns };
  };

  const getColumns: t.FetchSheetColumns = async (args) => {
    before('getColumns', args);
    const def = data.defs[args.ns];
    const columns = def?.columns;
    res.getColumnsCount++;
    return { columns };
  };

  const getCells: t.FetchSheetCells = async (args) => {
    before('getCells', args);
    const rows = coord.cell.max.row(Object.keys(data.cells || {})) + 1;
    const total = { rows };
    res.getCellsCount++;
    return {
      cells: data.cells ? filterCells(args.query, data.cells) : undefined,
      total,
    };
  };

  type T = t.ISheetFetcher & {
    getNsCount: number;
    getColumnsCount: number;
    getCellsCount: number;
  };

  const res: T = {
    ...fromFuncs({ getNs, getColumns, getCells }),
    getNsCount: 0,
    getColumnsCount: 0,
    getCellsCount: 0,
  };

  return res;
};

/**
 * Generate a stub data [fetch] object, to operate against an:
 *  - instance (sheet)
 *  - type-def (sheet)
 */
const instance = async <T>(args: {
  instance: string;
  implements: string;
  defs: { [ns: string]: t.ITypeDefPayload };
  rows?: T[];
  cells?: t.ICellMap;
  cache?: t.IMemoryCache;
  getTypeDef?: (defs: t.INsTypeDef[]) => t.INsTypeDef;
}) => {
  const loaded = await TypeClient.load({
    ns: args.implements,
    fetch: fetch({ defs: args.defs }),
    cache: args.cache,
  });

  const typeDef = args.getTypeDef ? args.getTypeDef(loaded.defs) : loaded.defs[0];
  const cells = {
    ...(args.cells || {}),
    ...objectToCells<T>(typeDef).rows(0, args.rows || []),
  };

  const def: t.ITypeDefPayload = {
    ns: { type: { implements: args.implements } },
    columns: {},
  };

  return fetch({
    cells,
    defs: { ...args.defs, [args.instance]: def },
  });
};

/**
 * Generate a stub data [fetch] object using the provided
 * type-defs and cells object as source data.
 *
 * NOTE:
 *    This by-passes talking to the HTTP=>DB systems and
 *    thereby allows tests of the TypeSystem to run in a
 *    decoupled manner.
 */
export const stub = {
  fetch,
  instance,
};

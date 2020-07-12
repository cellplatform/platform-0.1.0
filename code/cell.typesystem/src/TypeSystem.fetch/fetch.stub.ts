import { coord, t, Uri } from '../common';
import { TypeClient } from '../TypeSystem.core/TypeClient';
import { objectToCells } from '../util';
import { fromFuncs } from './fetch.fromFuncs';

type M = 'getNs' | 'getColumns' | 'getCells';

export type IStubFetcher = t.ISheetFetcher & {
  count: {
    getNs: number;
    getColumns: number;
    getCells: number;
  };
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
    const key = Uri.ns(args.ns).toString();
    const def = data.defs[key];
    const ns = !def ? undefined : ((def.ns || {}) as t.INsProps);
    res.count = { ...res.count, getNs: res.count.getNs + 1 };
    return { ns };
  };

  const getColumns: t.FetchSheetColumns = async (args) => {
    before('getColumns', args);
    const def = data.defs[args.ns];
    const columns = def?.columns;
    res.count = { ...res.count, getColumns: res.count.getColumns + 1 };
    return { columns };
  };

  const getCells: t.FetchSheetCells = async (args) => {
    before('getCells', args);
    const rows = coord.cell.max.row(Object.keys(data.cells || {})) + 1;
    const total = { rows };
    const cells = data.cells ? filterCells(args.query, data.cells) : undefined;
    res.count = { ...res.count, getCells: res.count.getCells + 1 };
    return { cells, total };
  };

  const res: IStubFetcher = {
    ...fromFuncs({ getNs, getColumns, getCells }),
    count: {
      getNs: 0,
      getColumns: 0,
      getCells: 0,
    },
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

import { t, CellRange } from '../../common';

/**
 * A cache entry that represents cells for a single namespace
 * that may be progressively increased in size as additional
 * queries are made against the namespace.
 */
export class TypeCacheCells {
  /**
   * [Lifecycle]
   */
  public static create = (ns: string) => new TypeCacheCells(ns);
  private constructor(ns: string) {
    this.ns = ns.toString();
  }

  /**
   * [Fields]
   */
  public readonly ns: string;
  public total: t.FetchSheetCellsResult['total'] = { rows: 0 };
  public cells: t.ICellMap = {};
  public error?: t.IHttpError;

  /**
   * [Methods]
   */
  public query(query: string) {
    const self = this; // eslint-disable-line
    query = (query || '').trim();

    const toFullRow = (range: CellRange) => `${range.left.row + 1}:${range.right.row + 1}`;
    const range = CellRange.fromKey(query).square;

    const api = {
      /**
       * The query range (string).
       */
      toString: () => query,

      /**
       * Determine if the query is currently accounted for in
       * the cached set of retrieved cells.
       */
      get exists() {
        const keys = Object.keys(self.cells);
        return keys.length === 0
          ? false
          : CellRange.fromKey(toFullRow(CellRange.square(keys))).contains(query);
      },

      /**
       * Perform query and retrieve result-set.
       */
      get: async (fetch: t.ISheetFetcher): Promise<t.FetchSheetCellsResult> => {
        const ns = this.ns;

        // Check if the result-set has aleady been cached.
        if (api.exists) {
          return this.toResult({ range });
        }

        // Query data.
        // NB: Adjust query to pull entire rows.
        const res = await fetch.getCells({ ns, query: toFullRow(range) });

        // Store state.
        this.cells = res.cells ? { ...this.cells, ...res.cells } : this.cells;
        this.total = { ...this.total, ...res.total };
        this.error = res.error ? res.error : this.error;

        // Finish up.
        return this.toResult({ range });
      },
    };

    return api;
  }

  /**
   * [Helpers]
   */

  private filterCells(args: { range: string | CellRange; cells: t.ICellMap }) {
    const cells = args.cells;
    const range = typeof args.range === 'object' ? args.range : CellRange.fromKey(args.range);
    return Object.keys(cells).reduce((acc, next) => {
      if (range.contains(next)) {
        acc[next] = cells[next];
      }
      return acc;
    }, {});
  }

  private toResult(args: { range: string | CellRange }) {
    const { range } = args;
    return {
      cells: this.filterCells({ range, cells: this.cells }),
      total: this.total,
      error: this.error,
    };
  }
}

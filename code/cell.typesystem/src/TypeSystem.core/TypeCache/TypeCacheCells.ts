import { t, CellRange, Uri } from '../../common';

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
  private rowQueries: string[] = [];

  /**
   * [Methods]
   */
  public query(query: string) {
    query = (query || '').trim();
    const self = this; // eslint-disable-line
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
        return self.rowQueries.some((rows) => CellRange.fromKey(rows).contains(query));
      },

      /**
       * Perform query and retrieve result-set.
       */
      get: async (
        fetch: t.ISheetFetcher,
        options: { force?: boolean } = {},
      ): Promise<t.FetchSheetCellsResult> => {
        const ns = this.ns;

        // Check if the result-set has aleady been cached.
        if (!options.force && api.exists) {
          return this.toResult({ range });
        }

        // Query data.
        // NB: Adjust query to pull entire rows.
        const rowQuery = this.toFullRow(range);
        const res = await fetch.getCells({ ns, query: rowQuery });

        // Store state.
        this.cells = res.cells ? { ...this.cells, ...res.cells } : this.cells;
        this.total = { ...this.total, ...res.total };
        this.error = res.error ? res.error : this.error;

        // Store reference to the row query.
        this.rowQueries = this.rowQueries.includes(rowQuery)
          ? this.rowQueries
          : [...this.rowQueries, rowQuery];

        // Finish up.
        return this.toResult({ range });
      },
    };

    return api;
  }

  /**
   * Syncs the cache with any changes contained within the given sync event.
   */
  public sync(changes: t.ITypedSheetChanges): t.ICellMap {
    const cells = changes.cells || {};
    const keys = Object.keys(cells);
    if (keys.length === 0) {
      return {};
    }

    const ns = Uri.strip.ns(this.ns);
    const diffs = keys
      .map((key) => cells[key])
      .filter((diff) => diff.kind === 'CELL' && Uri.strip.ns(diff.ns) === ns)
      .reduce((acc, diff) => {
        acc[diff.key] = diff.to;
        return acc;
      }, {} as t.ICellMap);

    this.cells = { ...this.cells, ...diffs };
    return diffs;
  }

  /**
   * [Helpers]
   */
  private toRange(input: string | CellRange) {
    return typeof input === 'object' ? input : CellRange.fromKey(input);
  }

  private toFullRow(input: string | CellRange) {
    const range = this.toRange(input);
    return `${range.left.row + 1}:${range.right.row + 1}`;
  }

  private filterCells(args: { range: string | CellRange; cells: t.ICellMap }) {
    const cells = args.cells;
    const range = this.toRange(args.range);
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

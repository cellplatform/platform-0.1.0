import { R, value as valueUtil, t } from '../../common';
import { CellRange } from '../CellRange';
import { cell as cellUtil, cell } from '../../cell';

/**
 * Represents a set of unions.
 */
export class CellRangeUnion {
  /**
   * [Static]
   */

  /**
   * Creates the set of ranges from a series of range-keys.
   */
  public static fromKey = (rangeKeys: string | string[]) => {
    let keys = Array.isArray(rangeKeys)
      ? rangeKeys
      : valueUtil.compact(rangeKeys.trim().split(','));
    keys = keys.filter((key) => !valueUtil.isBlank(key)).map((key) => key.trim());
    const ranges = R.uniq(keys).map((key) => CellRange.fromKey(key).square);
    return new CellRangeUnion({ ranges });
  };

  /**
   * Determines whether the given cell is contained within the given set.
   */
  public static contains(ranges: CellRange[], cell: t.ICoordPosition | string) {
    const key = cellUtil.toCell(cell).key;
    return ranges.some((range) => range.contains(key));
  }

  /**
   * [Lifecycle]
   */
  private constructor(options: { ranges: CellRange[] }) {
    const { ranges } = options;
    this.ranges = ranges;
  }

  /**
   * [Fields]
   */
  private readonly _: { key?: string; keys?: string[] } = {};

  /**
   * The list of [CellRange] items within the set.
   */
  public readonly ranges: CellRange[] = [];

  /**
   * [Properties]
   */

  public get column() {
    return this.axis('COLUMN');
  }

  public get row() {
    return this.axis('ROW');
  }

  /**
   * Retrieves the number of ranges within the set.
   */
  public get length() {
    return this.ranges.length;
  }

  /**
   * Retrieves the key of all ranges.
   */
  public get key() {
    return this._.key ? this._.key : (this._.key = this.ranges.map((r) => r.key).join(', '));
  }

  /**
   * Retrieves a sorted array of unique cell-keys across all ranges
   * within the set (eg. [A1, A2, B1...]).
   *  Note:
   *
   *    - Returns empty array when the range is COLUMN or ROW as
   *      these are logical ranges and the array would be infinite.
   *
   *    - The result is cached, future calls to this property do
   *      not incur the cost of calcualting the set of keys.
   */
  public get keys() {
    if (!this._.keys) {
      const keySets = this.ranges.map((range) => range.keys);
      let keys: string[] = R.uniq(valueUtil.flatten(keySets));
      keys = cell.sort<string>(keys);
      this._.keys = keys;
    }
    return this._.keys as string[];
  }

  /**
   * Creates a range enclosing all ranges in the union (top-left to bottom-right).
   */
  public get square() {
    let keys = this.ranges.reduce((acc, next) => {
      acc.push(next.left.key);
      acc.push(next.right.key);
      return acc;
    }, [] as string[]);
    keys = cell.sort(keys);
    return keys.length === 0 ? undefined : CellRange.fromCells(keys[0], keys[keys.length - 1]);
  }

  /**
   * [Methods]
   */

  /**
   * Determines whether the given cell is contained within the set.
   */
  public contains(cell: t.ICoordPosition | string): boolean {
    return CellRangeUnion.contains(this.ranges, cell);
  }

  /**
   * Retrieves the edge(s) the given cell is on.
   */
  public edge(cell: string | t.ICoordPosition): t.CoordEdge[] {
    const cellAddress = cellUtil.toCell(cell);
    if (!this.contains(cellAddress)) {
      return [];
    }

    const siblingEdges = (range: CellRange, edge: t.CoordEdge) => {
      const sibling = cellUtil.sibling(cellAddress, edge);
      return sibling ? range.edge(sibling) : undefined;
    };

    const siblingIncludesOppositeEdge = (range: CellRange, edge: t.CoordEdge) => {
      const edges = siblingEdges(range, edge);
      return edges ? edges.includes(cellUtil.oppositeEdge(edge)) : undefined;
    };

    const siblingIncludesCellWithoutEdge = (range: CellRange, edge: t.CoordEdge) => {
      if (!range.contains(cellAddress.key)) {
        return false;
      }
      const edges = siblingEdges(range, edge) || [];
      return edges.length === 0 ? true : !edges.includes(cellUtil.oppositeEdge(edge));
    };

    // Construct a map of edges.
    type EdgeMap = {
      [edge: string]: { within: CellRange[]; without: CellRange[] };
    };
    const map: EdgeMap = {};
    this.ranges.forEach((range) => {
      const edges = range.edge(cellAddress);

      // Add default edges.
      edges
        .filter((edge) => !map[edge])
        .forEach((edge) => {
          map[edge] = { within: [], without: [] };
        });

      // Append range to the list of edges the cell is within.
      edges.forEach((edge) => {
        const within = map[edge].within;
        map[edge].within = [...within, range];
      });
    });
    Object.keys(map).forEach((key) => {
      const item = map[key];
      item.without = this.ranges.filter((range) => {
        return !item.within.some((r) => r.key === range.key);
      });
    });

    // Filter out edges for cells that are included in other ranges within the set.
    Object.keys(map).forEach((key: string) => {
      const item = map[key];
      const edge = key as t.CoordEdge;
      const { within, without } = item;
      item.within = within.filter((range) => {
        return !without.some((otherRange) => {
          if (siblingIncludesCellWithoutEdge(otherRange, edge)) {
            return true;
          }
          if (siblingIncludesOppositeEdge(otherRange, edge)) {
            return true;
          }
          return false;
        });
      });
    });

    return (
      Object
        // Reduce map to final set of [CellEdge] items.
        .keys(map)
        .filter((key) => map[key].within.length > 0) as t.CoordEdge[]
    );
  }

  /**
   * Filters the set of ranges returning a new [CellRangeUnion].
   */
  public filter(fn: (range: CellRange, i: number) => boolean) {
    const keys = this.ranges.filter((range, i) => fn(range, i)).map((range) => range.key);
    return CellRangeUnion.fromKey(keys);
  }

  /**
   * Formats range keys based on table size, returning a new [Range] object.
   */
  public formated(args: { totalColumns: number; totalRows: number }) {
    const keys = this.ranges.map((range) => range.formated(args)).map((range) => range.key);
    return CellRangeUnion.fromKey(keys);
  }

  /**
   * Retrieves details about a single axis (COLUMN/ROW).
   */
  public axis(axis: t.CoordAxis) {
    const self = this; // eslint-disable-line

    const res = {
      /**
       * Retrieves the ROW or COLUMN keys represented by the ranges (de-duped).
       */
      get keys(): string[] {
        const keys = R.flatten(self.ranges.map((range) => range.axis(axis).keys));
        return R.uniq(keys);
      },
    };

    return res;
  }

  /**
   * Converts the union to a display string.
   */
  public toString() {
    const square = this.square;
    const keys = square ? square.key : '[]';
    return `[UNION(${this.length})/${keys}]`;
  }
}

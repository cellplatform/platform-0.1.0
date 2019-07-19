import { R, value as valueUtil, t } from '../../common';
import { CellRange } from '../CellRange';
import { cell as cellUtil } from '../../cell';

/**
 * Represents a set of unions.
 */
export class CellRangeUnion {
  /**
   * Creates the set of ranges from a series of range-keys.
   */
  public static fromKeys = (rangeKeys: string[]) => {
    const keys = rangeKeys.filter(key => !valueUtil.isBlank(key)).map(key => key.trim());
    const ranges = R.uniq(keys).map(key => CellRange.fromKey(key));
    return new CellRangeUnion({ ranges });
  };

  public static fromKey = (rangeKeys: string) => {
    const keys = valueUtil.compact(rangeKeys.trim().split(','));
    return CellRangeUnion.fromKeys(keys);
  };

  /**
   * Determines whether the given cell is contained within the given set.
   */
  public static contains(ranges: CellRange[], cell: t.IGridCellPosition | string) {
    const key = cellUtil.toCell(cell).key;
    return ranges.some(range => range.contains(key));
  }

  private internal: { key?: string; keys?: string[] } = {};

  private constructor(options: { ranges: CellRange[] }) {
    const { ranges } = options;
    this.ranges = ranges;
  }

  /**
   * Retrieves the key of all ranges.
   */
  public get key() {
    return this.internal.key
      ? this.internal.key
      : (this.internal.key = this.ranges.map(r => r.key).join(', '));
  }
  /**
   * The list of [CellRange] items within the set.
   */
  public readonly ranges: CellRange[] = [];

  /**
   * Retrieves the number of ranges within the set.
   */
  public get length() {
    return this.ranges.length;
  }

  /**
   * Determines whether the given cell is contained within the set.
   */
  public contains(cell: t.IGridCellPosition | string): boolean {
    return CellRangeUnion.contains(this.ranges, cell);
  }

  /**
   * Retrieves a sorted array of unique cell-keys across all ranges
   * within the set (eg. [A1, A2, B1...]).
   *  Note:
   *    - Returns empty array when the range is COLUMN or ROW as
   *      these are logical ranges and the array would be infinite.
   *    - The result is cached, future calls to this property do
   *      not incur the cost of calcualting the set of keys.
   */
  public get keys() {
    if (this.internal.keys) {
      return this.internal.keys;
    }
    const done = (result: string[]) => {
      this.internal.keys = result;
      return result;
    };

    const keys = this.ranges.map(range => range.keys);
    return done(R.uniq(valueUtil.flatten(keys)));
  }

  /**
   * Retrieves the edge(s) the given cell is on.
   */
  public edge(cell: string | t.IGridCellPosition): t.GridCellEdge[] {
    const cellAddress = cellUtil.toCell(cell);
    if (!this.contains(cellAddress)) {
      return [];
    }

    const siblingEdges = (range: CellRange, edge: t.GridCellEdge) => {
      const sibling = cellUtil.sibling(cellAddress, edge);
      return sibling ? range.edge(sibling) : undefined;
    };

    const siblingIncludesOppositeEdge = (range: CellRange, edge: t.GridCellEdge) => {
      const edges = siblingEdges(range, edge);
      return edges ? edges.includes(cellUtil.oppositeEdge(edge)) : undefined;
    };

    const siblingIncludesCellWithoutEdge = (range: CellRange, edge: t.GridCellEdge) => {
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
    this.ranges.forEach(range => {
      const edges = range.edge(cellAddress);

      // Add default edges.
      edges
        .filter(edge => !Boolean(map[edge]))
        .forEach(edge => {
          map[edge] = { within: [], without: [] };
        });

      // Append range to the list of edges the cell is within.
      edges.forEach(edge => {
        const within = map[edge].within;
        map[edge].within = [...within, range];
      });
    });
    Object.keys(map).forEach(key => {
      const item = map[key];
      item.without = this.ranges.filter(range => {
        return !item.within.some(r => r.key === range.key);
      });
    });

    // Filter out edges for cells that are included in other ranges within the set.
    Object.keys(map).forEach((key: string) => {
      const item = map[key];
      const edge = key as t.GridCellEdge;
      const { within, without } = item;
      item.within = within.filter(range => {
        return !without.some(otherRange => {
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

    return Object.keys(map)
      // Reduce map to final set of [CellEdge] items.
      .filter(key => map[key].within.length > 0) as t.GridCellEdge[];
  }
}

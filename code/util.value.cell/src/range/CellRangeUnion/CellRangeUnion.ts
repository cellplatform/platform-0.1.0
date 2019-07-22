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
    keys = keys.filter(key => !valueUtil.isBlank(key)).map(key => key.trim());
    const ranges = R.uniq(keys).map(key => CellRange.fromKey(key).square);
    return new CellRangeUnion({ ranges });
  };

  /**
   * Determines whether the given cell is contained within the given set.
   */
  public static contains(ranges: CellRange[], cell: t.ICoord | string) {
    const key = cellUtil.toCell(cell).key;
    return ranges.some(range => range.contains(key));
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
    return this._.key ? this._.key : (this._.key = this.ranges.map(r => r.key).join(', '));
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
      const keySets = this.ranges.map(range => range.keys);
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
    const keys = this.keys;
    return keys.length === 0 ? undefined : CellRange.fromCells(keys[0], keys[keys.length - 1]);
  }

  /**
   * [Methods]
   */

  /**
   * Determines whether the given cell is contained within the set.
   */
  public contains(cell: t.ICoord | string): boolean {
    return CellRangeUnion.contains(this.ranges, cell);
  }

  /**
   * Retrieves the edge(s) the given cell is on.
   */
  public edge(cell: string | t.ICoord): t.CoordEdge[] {
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
      const edge = key as t.CoordEdge;
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

    return (
      Object
        // Reduce map to final set of [CellEdge] items.
        .keys(map)
        .filter(key => map[key].within.length > 0) as t.CoordEdge[]
    );
  }

  /**
   * Converts the union to a display string.
   */
  public toString() {
    const square = this.square;
    const keys = square ? square.key : '[]';
    return `[union:${keys}]`;
  }
}

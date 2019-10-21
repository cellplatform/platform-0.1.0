import { t, hash, diff, R } from '../common';

export type CellChangeField = keyof t.IGridCellProps | 'VALUE' | 'PROPS';

/**
 * Determine if the given cell is empty (no value, no props).
 */
export function isEmptyCell(cell?: t.ICellData) {
  return cell ? isEmptyCellValue(cell.value) && isEmptyCellProps(cell.props) : true;
}

/**
 * Determine if the given cell value is empty.
 */
export function isEmptyCellValue(value?: t.CellValue) {
  return value === '' || value === undefined;
}

/**
 * Determine if the given cell props is empty.
 */
export function isEmptyCellProps(props?: t.ICellProps) {
  if (typeof props !== 'object') {
    return true;
  }

  const keys = Object.keys(props);
  if (keys.length === 0) {
    return true;
  }

  for (const key of keys) {
    const child = props[key];
    if (key === 'value') {
      if (child !== undefined) {
        return false;
      }
    } else {
      if (typeof child === 'object') {
        if (Object.keys(child).length > 0) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}

/**
 * Produces a uniform hash (SHA-256) of the given cell's value/props.
 */
export function cellHash(key: string, data?: t.ICellData): string {
  const value = data ? data.value : undefined;
  const props = squashProps(data ? data.props : undefined);
  const sha256 = hash.sha256({ key, value, props });
  return `sha256/${sha256}`;
}

/**
 * Collapses empty props.
 */
export function squashProps(props?: t.ICellProps) {
  if (!props) {
    return undefined;
  } else {
    const isNil = (value: any) =>
      value === undefined || (typeof value === 'object' && Object.keys(value).length === 0);
    const res = { ...props };
    Object.keys(res)
      .filter(key => isNil(res[key]))
      .forEach(key => delete res[key]);
    return isNil(res) ? undefined : res;
  }
}

/**
 * Compare two cells.
 */
export function cellDiff(left: t.ICellData, right: t.ICellData): t.ICellDiff {
  const list = diff.compare(left, right) as Array<diff.Diff<t.ICellData>>;
  const isDifferent = list.length > 0;
  return { left, right, isDifferent, list };
}

/**
 * Determine if a cell's fields (value/props) has changed.
 */
export function isCellChanged(
  left: t.ICellData | undefined,
  right: t.ICellData | undefined,
  field?: CellChangeField | CellChangeField[],
) {
  // Convert incoming `field` flag to an array.
  let fields: CellChangeField[] =
    field === undefined ? ['VALUE', 'PROPS'] : Array.isArray(field) ? field : [field];

  // Expand `PROPS` to actual props fields.
  fields = R.flatten(
    fields.map(field => (field === 'PROPS' ? ['style', 'merge'] : field)),
  ) as CellChangeField[];

  // Look for any matches.
  return fields.some(field => {
    let a: any;
    let b: any;
    if (field === 'VALUE') {
      a = left ? left.value : undefined;
      b = right ? right.value : undefined;
    } else {
      const props = {
        left: (left ? left.props : undefined) || {},
        right: (right ? right.props : undefined) || {},
      };
      a = props.left[field];
      b = props.right[field];
    }
    return !R.equals(a, b);
  });
}

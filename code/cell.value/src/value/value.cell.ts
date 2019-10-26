import { t, hash, diff, R } from '../common';

export type CellChangeField = 'VALUE' | 'PROPS';

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
 * Assigns a property field to props, removing it from the object
 * if it is the default value.
 */
export function setCellProp<P extends t.ICellProps, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
  value?: P[K][keyof P[K]];
}): P | undefined {
  const props = args.props || {};
  const defaults = args.defaults;
  const field = args.field as string;
  const section: P[K] = { ...(props[args.section as string] || {}), [field]: args.value };

  // Strip default values from the property section.
  if (defaults && typeof defaults === 'object') {
    Object.keys((defaults as unknown) as object)
      .filter(key => R.equals(section[key], defaults[key]))
      .forEach(key => delete section[key]);
  }

  // Strip undefined values from property section.
  if (typeof section === 'object') {
    Object.keys((section as unknown) as object)
      .filter(key => section[key] === undefined)
      .forEach(key => delete section[key]);
  }

  // Remove the section from the root props if empty.
  const res = { ...props, [args.section]: section };
  const isEmptySection = Object.keys((section as unknown) as object).length === 0;
  if (isEmptySection) {
    delete res[args.section as string];
  }

  // Finish up.
  return isEmptyCellProps(res) ? undefined : (res as P);
}

/**
 * Toggles the given boolean property field, removing it from the object
 * if it is the default value.
 */
export function toggleCellProp<P extends t.ICellProps, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
}): P | undefined {
  const props = args.props || {};
  const field = args.field as string;
  const section = (props[args.section as string] || {}) as {};
  const value = section[field];
  if (!(value === undefined || typeof value === 'boolean')) {
    return props as P; // NB: non-supported value type for toggling.
  }
  const toggled: any = typeof value === 'boolean' ? !value : true;
  return setCellProp<P, K>({ ...args, value: toggled });
}

/**
 * Retrieves the property value from the given cell.
 */
export function cellPropValue(cell?: t.ICellData): t.CellValue {
  return cell && cell.props ? cell.props.value : undefined;
}

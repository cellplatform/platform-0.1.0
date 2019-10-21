import { diff, hash, R, t } from '../common';

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
 * Produces a uniform cell properties object.
 */
export function toCellProps(input?: t.IGridCellProps): t.IGridCellPropsAll {
  const props = input || {};
  const value: t.CellValue = props.value;
  const style: t.IGridCellPropsStyle = props.style || {};
  const merge: t.ICellPropsMerge = props.merge || {};
  const view: t.IGridCellPropsView = props.view || {};
  const status: t.IGridCellPropsStatus = props.status || {};
  return { value, style, merge, view, status };
}

/**
 * Assigns a property field to props, removing it from the object
 * if it is the default value.
 */
export function setCellProp<S extends keyof t.IGridCellProps>(args: {
  props?: t.IGridCellProps;
  defaults: t.IGridCellProps[S];
  section: S;
  field: keyof t.IGridCellPropsAll[S];
  value?: t.IGridCellPropsAll[S][keyof t.IGridCellPropsAll[S]];
}): t.IGridCellProps | undefined {
  const props = args.props || {};
  const defaults = args.defaults;
  const field = args.field as string;
  const section: t.IGridCellProps[S] = { ...(props[args.section] || {}), [field]: args.value };

  // Strip default values from the property section.
  if (defaults && typeof defaults === 'object') {
    Object.keys(defaults as object)
      .filter(key => R.equals(section[key], defaults[key]))
      .forEach(key => delete section[key]);
  }

  // Strip undefined values from property section.
  if (typeof section === 'object') {
    Object.keys(section as object)
      .filter(key => section[key] === undefined)
      .forEach(key => delete section[key]);
  }

  // Remove the section from the root props if empty.
  const res = { ...props, [args.section]: section };
  const isEmptySection = Object.keys(section as object).length === 0;
  if (isEmptySection) {
    delete res[args.section as string];
  }

  // Finish up.
  return isEmptyCellProps(res) ? undefined : res;
}

/**
 * Assigns (or removes) a cell error on `props.status.error`.
 */
export function setCellError(args: {
  props?: t.IGridCellProps;
  error?: t.IGridCellPropsError;
}): t.IGridCellProps | undefined {
  const { props, error } = args;
  return setCellProp({
    props,
    defaults: {},
    section: 'status',
    field: 'error',
    value: error,
  });
}

/**
 * Toggles the given boolean property field, removing it from the object
 * if it is the default value.
 */
export function toggleCellProp<S extends keyof t.IGridCellProps>(args: {
  props?: t.IGridCellProps;
  defaults: t.IGridCellProps[S];
  section: S;
  field: keyof t.IGridCellPropsAll[S];
}): t.IGridCellProps | undefined {
  const props = args.props || {};
  const field = args.field as string;
  const section = (props[args.section] || {}) as {};
  const value = section[field];
  if (!(value === undefined || typeof value === 'boolean')) {
    return props; // NB: non-supported value type for toggling.
  }
  const toggled: any = typeof value === 'boolean' ? !value : true;
  return setCellProp<S>({ ...args, value: toggled });
}

/**
 * Determine if a cell's fields (value/props) has changed.
 */
export function isCellChanged(
  left: t.IGridCellData | undefined,
  right: t.IGridCellData | undefined,
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

/**
 * Compare two cells.
 */
export function cellDiff(left: t.ICellData, right: t.ICellData): t.ICellDiff {
  const list = diff.compare(left, right) as Array<diff.Diff<t.ICellData>>;
  const isDifferent = list.length > 0;
  return { left, right, isDifferent, list };
}

/**
 * Produces a uniform hash (SHA-256) of the given cell's value/props.
 */
export function cellHash(key: string, data?: t.ICellData): string {
  const value = data ? data.value : undefined;
  const props = toCellProps(data ? data.props : undefined);
  const sha256 = hash.sha256({ key, value, props });
  return `sha256/${sha256}`;
}

/**
 * TEMP 🐷
 */

// /**
//  * Produces a uniform hash (SHA-256) of the given cell's value/props.
//  */
// export function rowHash(key: string, data?: t.IGridCellData): string {
//   const value = data ? data.value : undefined;
//   const props = toCellProps(data ? data.props : undefined);
//   const sha256 = hash.sha256({ key, value, props });
//   return `sha256/${sha256}`;
// }

// /**
//  * Produces a uniform hash (SHA-256) of the given cell's value/props.
//  */
// export function columnHash(key: string, data?: t.IGridRowData): string {
//   const value = data ? data.value : undefined;
//   const props = toCellProps(data ? data.props : undefined);
//   const sha256 = hash.sha256({ key, value, props });
//   return `sha256/${sha256}`;
// }

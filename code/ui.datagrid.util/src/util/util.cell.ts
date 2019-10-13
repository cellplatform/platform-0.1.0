import { t, R, diff, hash } from '../common';

export type CellChangeField = keyof t.ICellProps | 'VALUE' | 'PROPS';

/**
 * Determine if the given cell is empty (no value, no props).
 */
export function isEmptyCell(cell?: t.IGridCell) {
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
    if (typeof child === 'object') {
      if (Object.keys(child).length > 0) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Produces a uniform cell properties object.
 */
export function toCellProps(input?: t.ICellProps): t.ICellPropsAll {
  const props = input || {};
  const value: t.CellValue = props.value;
  const style: t.ICellPropsStyle = props.style || {};
  const merge: t.ICellPropsMerge = props.merge || {};
  const view: t.ICellPropsView = props.view || {};
  const status: t.ICellPropsStatus = props.status || {};
  return { value, style, merge, view, status };
}

/**
 * Assignes a property field to props, removing it from the object
 * if it is the default value.
 */
export function setCellProp<S extends keyof t.ICellProps>(args: {
  props?: t.ICellProps;
  defaults: t.ICellProps[S];
  section: S;
  field: keyof t.ICellPropsAll[S];
  value?: t.ICellPropsAll[S][keyof t.ICellPropsAll[S]];
}): t.ICellProps | undefined {
  const props = args.props || {};
  const defaults = args.defaults;
  const field = args.field as string;
  const section: t.ICellProps[S] = { ...(props[args.section] || {}), [field]: args.value };

  // Strip default values from the property section.
  if (defaults && typeof defaults === 'object') {
    Object.keys(defaults as object)
      .filter(key => R.equals(section[key], defaults[key]))
      .forEach(key => delete section[key]);
  }

  // Remove the section from the root props if empty.
  const res = { ...props, [args.section]: section };
  const isEmptySection = Object.keys(section as object).length === 0;
  if (isEmptySection) {
    delete res[args.section];
  }

  // Finish up.
  return isEmptyCellProps(res) ? undefined : res;
}

/**
 * Toggles the given boolean property field, removing it from the object
 * if it is the default value.
 */
export function toggleCellProp<S extends keyof t.ICellProps>(args: {
  props?: t.ICellProps;
  defaults: t.ICellProps[S];
  section: S;
  field: keyof t.ICellPropsAll[S];
}): t.ICellProps | undefined {
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
  left: t.IGridCell | undefined,
  right: t.IGridCell | undefined,
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
export function cellDiff(left: t.IGridCell, right: t.IGridCell): t.ICellDiff {
  const list = diff.compare(left, right) as Array<diff.Diff<t.IGridCell>>;
  const isDifferent = list.length > 0;
  return { left, right, isDifferent, list };
}

/**
 * Produces a uniform hash (SHA-256) of the given cell's value/props.
 */
export function cellHash(key: string, data?: t.IGridCell): string {
  const value = data ? data.value : undefined;
  const props = toCellProps(data ? data.props : undefined);
  const sha256 = hash.sha256({ key, value, props });
  return `sha256/${sha256}`;
}

import { R, t, cell } from '../common';

export { cell };
export type CellChangeField = keyof t.IGridCellProps | 'VALUE' | 'PROPS';

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
  console.log(`\nTODO 🐷 use the version in [cell.value]  \n`);

  // cell.value.setCellProp<t.IGridCellPropsAll, S>(args)

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
  return cell.value.isEmptyCellProps(res) ? undefined : res;
}

/**
 * Assigns (or removes) a cell error on `props.status.error`.
 */
export function setCellError(args: {
  props?: t.IGridCellProps;
  error?: t.IGridCellPropsError;
}): t.IGridCellProps | undefined {
  console.log(`\nTODO 🐷  make Errors a first class concept on CellData - move to [cell.value] \n`);

  const { props, error } = args;
  return setCellProp({
    props,
    defaults: {},
    section: 'status',
    field: 'error',
    value: error,
  });
}

import { R, t } from '../common';
import { isEmptyCellProps } from './value.isEmpty.cell';
import { isEmptyColumnProps } from './value.isEmpty.column';
import { isEmptyRowProps } from './value.isEmpty.row';
import { isEmptyNsProps } from './value.isEmpty.ns';

type Props = t.ICellProps | t.IColumnProps | t.IRowProps | t.INsProps;

/**
 * Assigns a property field to {props}, removing it from the object
 * if it's the default value.
 */
export function setProp<P extends Props, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
  value?: P[K][keyof P[K]];
  isEmpty: (props?: P) => boolean;
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
  return args.isEmpty && args.isEmpty(res as P) ? undefined : (res as P);
}

/**
 * Assigns a property field to {props}, removing it from the object
 * if it's the default value.
 */
export function setCellProp<P extends t.ICellProps, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
  value?: P[K][keyof P[K]];
}): P | undefined {
  return setProp<P, K>({ ...args, isEmpty: isEmptyCellProps });
}

/**
 * Assigns a property field to {props}, removing it from the object
 * if it's the default value.
 */
export function setRowProp<P extends t.IRowProps, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
  value?: P[K][keyof P[K]];
}): P | undefined {
  return setProp<P, K>({ ...args, isEmpty: isEmptyRowProps });
}

/**
 * Assigns a property field to {props}, removing it from the object
 * if it's the default value.
 */
export function setColumnProp<P extends t.IColumnProps, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
  value?: P[K][keyof P[K]];
}): P | undefined {
  return setProp<P, K>({ ...args, isEmpty: isEmptyColumnProps });
}

/**
 * Assigns a property field to {props}, removing it from the object
 * if it's the default value.
 */
export function setNsProp<P extends t.INsProps, K extends keyof P>(args: {
  props?: Partial<P>;
  defaults: P[K];
  section: K;
  field: keyof P[K];
  value?: P[K][keyof P[K]];
}): P | undefined {
  return setProp<P, K>({ ...args, isEmpty: isEmptyNsProps });
}

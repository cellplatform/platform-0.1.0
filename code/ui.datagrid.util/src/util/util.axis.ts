import { t, defaultValue } from '../common';

/**
 * Produces a uniform row properties object.
 */
export function toGridRowProps(input?: t.IGridRowProps): t.IGridRowPropsAll {
  const props: t.IGridRowProps = input || {};
  const height = defaultValue(props.height, -1);
  return { height };
}

/**
 * Produces a uniform column properties object.
 */
export function toGridColumnProps(input?: t.IGridColumnProps): t.IGridColumnPropsAll {
  const props: t.IGridColumnProps = input || {};
  const width = defaultValue(props.width, -1);
  return { width };
}

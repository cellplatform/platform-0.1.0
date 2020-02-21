import { t } from '../common';
import { isEmptyProps } from './value.isEmpty';

/**
 * Determine if the given column's props are empty.
 */
export function isEmptyColumnProps(props?: t.IColumnProps) {
  return isEmptyProps(props);
}

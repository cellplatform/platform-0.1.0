import { t } from '../common';
import { isEmptyProps } from './value.isEmpty';

/**
 * Determine if the given row's props are empty.
 */
export function isEmptyRowProps(props?: t.IRowProps) {
  return isEmptyProps(props);
}

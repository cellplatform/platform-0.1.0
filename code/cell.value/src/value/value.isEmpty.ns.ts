import { t } from '../common';
import { isEmptyProps } from './value.isEmpty';

/**
 * Determine if the given namespace's props are empty.
 */
export function isEmptyNsProps(props?: t.INsProps) {
  return isEmptyProps(props);
}

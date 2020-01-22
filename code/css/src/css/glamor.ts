/**
 * See original library:
 *   https://github.com/threepointone/glamor
 *
 * Wrapper library
 *   https://github.com/dan-lee/glamor-jss/
 *
 */
import { t, jss } from '../common';
import { format } from './css';

export const merge: t.MergeCssRules = jss.merge;

/**
 * Converts a set of properties into hashed CSS class-names.
 */
export function className(...styles: Array<t.CssProps | undefined>): string {
  const names = styles.map(s => jss.style(format(s) as t.CssProps));
  return `${merge(names)}`;
}

import { css as glamor } from 'glamor';
import { CssProps, GlobalCssRules } from '../types';

/**
 * Applies global CSS rules.
 * https://github.com/threepointone/glamor/blob/master/docs/howto.md#global-css-rule
 *
 * Example:
 *
 *        const styles = {
 *          'html, body': { background: 'red' },
 *          'p': { color: 'blue' }
 *        };
 *        global(styles, { prefix: '.markdown' });
 *
 * Or create styles under a common selector "prefix":
 *
 *        const styles = {
 *          'p': { color: 'blue' },
 *        };
 *        global(styles, { prefix: '.markdown' });
 *
 */
export const global: GlobalCssRules = (
  styles: { [selector: string]: CssProps },
  options: { prefix?: string } = {},
) => {
  const { prefix } = options;
  Object.keys(styles).forEach(key => {
    const style = styles[key];
    let selector = prefix ? `${prefix} ${key}` : key;
    selector = selector
      .replace(/^\n/, '')
      .replace(/\n$/, '')
      .trim();
    glamor.global(selector, style);
  });
};

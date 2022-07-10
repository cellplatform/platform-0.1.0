import { t } from '../../common';

export * from '../../common';
export { Icons } from '../Icons';

/**
 * Constants
 */
export const THEMES: t.PropListTheme[] = ['Light', 'Dark'];
export const DEFAULTS = {
  theme: THEMES[0],
  fontSize: 12,
};

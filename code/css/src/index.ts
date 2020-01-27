import { ICssStyle, CssValue, CssProps } from './types';

export { CssValue, CssProps };
export { color } from './color';

/**
 * Primary {style} API.
 */
import * as api from './style';
export const style = api as ICssStyle;
export const css = style.format;

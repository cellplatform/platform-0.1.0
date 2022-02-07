import { ICssStyle, CssValue, CssProps } from './types';

export { CssValue, CssProps };
export { color } from './color';
export { reset } from './reset';

/**
 * Primary {style} API.
 */
import * as api from './style';
export const style = api as ICssStyle;
export const Style = style;
export const css = style.format;

import { color } from './color';
export const formatColor = color.format;

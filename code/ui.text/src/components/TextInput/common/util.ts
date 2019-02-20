import { color as colorUtil, toTextCss } from '../../../common';
import { ITextInputStyle } from '../types';

/**
 * Converts a set of Input styles into CSS.
 */
export function toTextInputCss(isEnabled: boolean, styles: ITextInputStyle) {
  const { color, disabledColor } = styles;
  return {
    ...toTextCss(styles),
    color: isEnabled
      ? colorUtil.format(color)
      : colorUtil.format(disabledColor),
  };
}

import { TextStyle } from '../types';
import { SYSTEM_FONT } from './constants';

import { color as colorUtil } from '@platform/css';

/**
 * Converts <Text> style props to a CSS object.
 */
export const toTextCss = (props: TextStyle) => {
  const {
    fontSize,
    color,
    fontWeight,
    fontFamily,
    align,
    italic,
    opacity,
    letterSpacing,
    lineHeight,
    textShadow,
    uppercase,
  } = pluckTextStyles(props);

  return {
    color: colorUtil.format(color),
    fontFamily,
    fontSize: fontSize,
    fontWeight: SYSTEM_FONT.WEIGHTS[fontWeight],
    fontStyle: italic ? 'italic' : undefined,
    textAlign: align.toLowerCase(),
    opacity,
    letterSpacing,
    lineHeight,
    textShadow: toTextShadow(textShadow),
    textTransform: uppercase ? ('uppercase' as React.CSSProperties['textTransform']) : undefined,
  };
};

export const pluckTextStyles = (props: any) => {
  const {
    fontSize,
    color = -0.7,
    fontWeight = 'NORMAL',
    fontFamily = SYSTEM_FONT.SANS.FAMILY,
    align = 'LEFT',
    italic = false,
    opacity = 1,
    letterSpacing,
    lineHeight,
    textShadow,
    uppercase = false,
  } = props;

  return {
    fontSize,
    color,
    fontWeight,
    fontFamily,
    align,
    italic,
    opacity,
    letterSpacing,
    lineHeight,
    textShadow,
    uppercase,
  };
};

/**
 * Produces a `textShadow` CSS value from an array.
 * [0:offset-y, 1:color.format()]
 */
export const toTextShadow = (value?: string | Array<number | string>) => {
  if (value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    return value as string;
  }
  return `0px ${value[0]}px ${colorUtil.format(value[1])}`;
};

import { ITextStyle } from '../types';
import { color as colorUtil } from './libs';
import { ROBOTO } from './constants';

/**
 * Converts <Text> style props to a CSS object.
 */
export function toTextCss(props: ITextStyle) {
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
    fontWeight: ROBOTO.WEIGHTS[fontWeight],
    fontStyle: italic ? 'italic' : undefined,
    textAlign: align.toLowerCase(),
    opacity,
    letterSpacing,
    lineHeight,
    textShadow: toShadow(textShadow),
    textTransform: uppercase ? ('uppercase' as React.CSSProperties['textTransform']) : undefined,
  };
}

export function pluckTextStyles(props: any) {
  const {
    fontSize,
    color = -0.7,
    fontWeight = 'NORMAL',
    fontFamily = ROBOTO.FAMILY,
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
}

/**
 * Produces a `textShadow` CSS value from an array.
 * [0:offset-y, 1:color.format()]
 */
export function toShadow(value?: string | Array<number | string>) {
  if (value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    return value as string;
  }
  return `0px ${value[0]}px ${colorUtil.format(value[1])}`;
}

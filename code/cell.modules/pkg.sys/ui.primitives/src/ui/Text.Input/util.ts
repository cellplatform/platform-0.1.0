import { ITextInputStyle, TextStyle } from './types';
import { MeasureSize, t, color as Color, SYSTEM_FONT, DEFAULT } from './common';

/**
 * Helpers
 */
export const Util = {
  /**
   * Converts a set of Input styles into CSS.
   */
  toTextInputCss(isEnabled: boolean, styles: ITextInputStyle) {
    return {
      ...Util.toTextCss(styles),
      color: isEnabled ? Color.format(styles.color) : Color.format(styles.disabledColor),
    };
  },

  /**
   * Converts <Text> style props to a CSS object.
   */
  toTextCss(props: TextStyle) {
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
    } = Util.pluckTextStyles(props);

    return {
      color: Color.format(color),
      fontFamily,
      fontSize: fontSize,
      fontWeight: SYSTEM_FONT.WEIGHTS[fontWeight],
      fontStyle: italic ? 'italic' : undefined,
      textAlign: align.toLowerCase(),
      opacity,
      letterSpacing,
      lineHeight,
      textShadow: Util.toTextShadow(textShadow),
      textTransform: uppercase ? ('uppercase' as React.CSSProperties['textTransform']) : undefined,
    };
  },

  pluckTextStyles(props: any) {
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
  },

  /**
   * Produces a `textShadow` CSS value from an array.
   * [0:offset-y, 1:color.format()]
   */
  toTextShadow(value?: string | Array<number | string>) {
    if (value === undefined) return;
    if (typeof value === 'string') return value as string;
    return `0px ${value[0]}px ${Color.format(value[1])}`;
  },

  /**
   * Measure the size of the text.
   */
  measure: {
    input(props: t.TextInputProps) {
      const { value: content, valueStyle = DEFAULT.TEXT.STYLE } = props;
      const style = Util.toTextCss(valueStyle);
      return MeasureSize.measure({ content, ...style });
    },
    text(props: t.TextProps) {
      const { children: content } = props;
      const style = { ...Util.toTextCss(props), ...props.style };
      return MeasureSize.measure({ content, ...style });
    },
  },
};

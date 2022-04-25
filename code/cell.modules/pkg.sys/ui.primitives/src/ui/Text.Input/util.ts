import { color as Color, DEFAULT, MeasureSize, R, SYSTEM_FONT, t } from './common';
import { TextInputStyle } from './types';

/**
 * Helpers
 */
export const Util = {
  /**
   * Textbox value helpers.
   */
  value: {
    format(args: { value?: string; maxLength?: number }) {
      const { maxLength } = args;
      let value = args.value || '';
      if (maxLength !== undefined && value.length > maxLength)
        value = value.substring(0, maxLength);
      return value;
    },

    getChangedChar(from: string, to: string) {
      if (to.length === from.length) return '';
      if (to.length < from.length) return '';

      let index = 0;
      for (const toChar of to) {
        const fromChar = from[index];
        if (toChar !== fromChar) return toChar; // Exit - changed character found.
        index += 1;
      }

      return ''; // No change.
    },
  },

  /**
   * Size measurement helpers.
   */
  measure: {
    input(props: t.TextInputProps) {
      const { value: content, valueStyle = DEFAULT.TEXT.STYLE } = props;
      const style = Util.css.toText(valueStyle);
      return MeasureSize.measure({ content, ...style });
    },
    text(props: t.TextProps) {
      const { children: content } = props;
      const style = { ...Util.css.toText(props), ...props.style };
      return MeasureSize.measure({ content, ...style });
    },
  },

  /**
   * CSS helpers
   */
  css: {
    toWidth(props: t.TextInputProps) {
      if (!props.autoSize) return props.width;

      const value = props.value;
      const maxWidth = props.maxWidth ?? -1;

      let width = Util.measure.input(props).width;
      width = value === undefined || value === '' ? Util.css.toMinWidth(props) : width;
      width =
        typeof maxWidth === 'number' && maxWidth !== -1 && width > maxWidth ? maxWidth : width;

      const charWidth = Util.measure.input({ ...props, value: 'W' }).width;
      return width + charWidth; // NB: Adding an additional char-width prevents overflow jumping on char-enter.
    },

    toMinWidth(props: t.TextInputProps): number {
      const { minWidth, placeholder, value } = props;

      if (minWidth !== undefined) return minWidth as number;

      // NB: If min-width not specified, use placeholder width.
      if (!value && placeholder) {
        return (
          Util.measure.text({
            children: props.placeholder,
            style: Util.css.toPlaceholder(props),
          }).width + 10
        );
      }

      return -1;
    },

    /**
     * Convert TextInput props to placeholder style.
     */
    toPlaceholder(props: t.TextInputProps) {
      const { isEnabled = true, valueStyle = DEFAULT.TEXT.STYLE, placeholderStyle } = props;
      const styles = { ...R.clone(valueStyle), ...placeholderStyle };
      return Util.css.toTextInput(isEnabled, styles);
    },

    /**
     * Converts a set of TextInput styles into CSS.
     */
    toTextInput(isEnabled: boolean, styles: TextInputStyle) {
      return {
        ...Util.css.toText(styles),
        color: isEnabled ? Color.format(styles.color) : Color.format(styles.disabledColor),
      };
    },

    /**
     * Converts <Text> style props to a CSS object.
     */
    toText(props: t.TextStyle) {
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
      } = Util.css.pluckText(props);

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
        textShadow: Util.css.toTextShadow(textShadow),
        textTransform: uppercase
          ? ('uppercase' as React.CSSProperties['textTransform'])
          : undefined,
      };
    },

    pluckText(props: any) {
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
  },
};

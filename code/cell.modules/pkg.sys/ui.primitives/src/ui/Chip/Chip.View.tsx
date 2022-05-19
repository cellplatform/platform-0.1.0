import React from 'react';
import { Color, COLORS, css, CssValue, t, DEFAULT } from './common';

export const height = 14;
const { DARK } = COLORS;

/**
 * Types
 */
export type ChipProps = {
  prefix?: React.ReactNode;
  body?: React.ReactNode | React.ReactNode[];
  suffix?: React.ReactNode;
  inline?: boolean;
  tooltip?: string;
  empty?: React.ReactNode;
  color?: string | number;
  borderRadius?: number;
  theme?: t.ChipTheme;
  style?: CssValue;
};

/**
 * Component
 */
export const View: React.FC<ChipProps> = (props) => {
  const { inline = true, theme = DEFAULT.THEME, borderRadius = 2 } = props;
  const body = (Array.isArray(props.body) ? props.body : [props.body]).filter(Boolean);
  const isEmpty = body.length === 0;
  const isLight = theme === 'Light';

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: inline ? 'block' : 'inline-block',
      position: 'relative',
      boxSizing: 'border-box',
      userSelect: 'none',
      height,
      overflow: 'hidden',
      Flex: 'x-center-center',
      lineHeight: 1,
      fontFamily: 'monospace',
      fontSize: 9,
      fontWeight: 600,
      color: props.color ?? isLight ? Color.alpha(DARK, 0.8) : Color.format(0.8),
    }),
    chip: css({
      height: height - 2, // NB: Border
      backgroundColor: isLight ? Color.alpha(DARK, 0.08) : Color.format(0.08),
      border: `solid 1px ${isLight ? Color.format(-0.06) : Color.format(0.1)}`,
      borderRadius,
      Flex: 'x-center-center',
    }),
    bodyPart: {
      base: css({ paddingTop: 1, paddingBottom: 1, PaddingX: 4 }),
      divider: css({
        borderRight: `solid 1px ${isLight ? Color.format(-0.12) : Color.format(0.12)}`,
      }),
    },
    empty: css({ opacity: 0.5, PaddingX: 4 }),
    prefix: css({ marginRight: 5 }),
    suffix: css({ marginLeft: 5 }),
  };

  const elEmpty = isEmpty && <div {...styles.empty}>{props.empty ?? `<empty>`}</div>;

  const elBody = body.map((content, i) => {
    const isLast = i === body.length - 1;
    const style = styles.bodyPart;
    return (
      <div key={`hash.${i}`} {...css(style.base, isLast ? undefined : style.divider)}>
        {content}
      </div>
    );
  });

  const elPrefix = !isEmpty && props.prefix && <div {...styles.prefix}>{props.prefix}</div>;
  const elSuffix = !isEmpty && props.suffix && <div {...styles.suffix}>{props.suffix}</div>;

  return (
    <div {...css(styles.base, props.style)} title={props.tooltip}>
      {elPrefix}
      <div {...styles.chip}>
        {elEmpty}
        {elBody}
      </div>
      {elSuffix}
    </div>
  );
};

/**
 * Helpers
 */

export function toBodyArray(input: ChipProps['body']) {
  return (Array.isArray(input) ? input : [input]).filter(Boolean);
}

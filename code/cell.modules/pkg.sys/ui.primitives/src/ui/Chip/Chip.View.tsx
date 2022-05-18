import React from 'react';
import { Color, COLORS, css, CssValue } from './common';

export const height = 14;

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
  style?: CssValue;
};

/**
 * Component
 */
export const View: React.FC<ChipProps> = (props) => {
  const { inline = true } = props;
  const body = (Array.isArray(props.body) ? props.body : [props.body]).filter(Boolean);
  const isEmpty = body.length === 0;

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
      color: Color.alpha(COLORS.DARK, 0.9),
    }),
    chip: css({
      height: height - 2, // NB: Border
      backgroundColor: Color.alpha(COLORS.DARK, 0.08),
      border: `solid 1px ${Color.format(-0.06)}`,
      borderRadius: 3,
      Flex: 'x-center-center',
    }),
    bodyPart: {
      base: css({ paddingTop: 1, paddingBottom: 1, PaddingX: 4 }),
      divider: css({ borderRight: `solid 1px ${Color.format(-0.12)}` }),
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

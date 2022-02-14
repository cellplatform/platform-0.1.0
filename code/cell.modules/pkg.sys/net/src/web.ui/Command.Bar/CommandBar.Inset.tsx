import React from 'react';
import { color, css, CssValue } from '../../common';

export type CommandBarInsetProps = {
  cornerRadius?: [number, number, number, number];
  borderTop?: string | number;
  boxShadow?: string;
  style?: CssValue;
};

export const CommandBarInset: React.FC<CommandBarInsetProps> = (props) => {
  const boxShadow = props.boxShadow ?? `inset 0 2px 6px ${color.format(-0.6)}`;

  const borderRadius = props.cornerRadius
    ?.map((value) => (value === 0 ? '0' : `${value}px`))
    .join(' ');

  const borderTop =
    props.borderTop === 'string'
      ? props.borderTop
      : `solid 1px ${color.format(props.borderTop ?? 0)}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({ pointerEvents: 'none', position: 'relative', boxShadow, borderRadius }),
    border: css({ borderTop }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.border} />
    </div>
  );
};

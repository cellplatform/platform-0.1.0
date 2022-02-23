import React from 'react';
import { color, css, CssValue, t } from '../../common';

export type TypeLabelProps = {
  text: string;
  style?: CssValue;
  color?: string | number;
  onClick?: (e: { text: string }) => void;
};

export const TypeLabel: React.FC<TypeLabelProps> = (props) => {
  const { text, onClick } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'monospace',
      color: props.color,
      cursor: onClick ? 'pointer' : 'default',
    }),
  };
  return (
    <div {...css(styles.base, props.style)} onClick={() => onClick?.({ text })}>
      {text}
    </div>
  );
};

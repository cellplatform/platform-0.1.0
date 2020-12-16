import React from 'react';
import { color, css, CssValue, COLORS } from '../../common';

export type ActionPanelTitleProps = { style?: CssValue };

export const ActionPanelTitle: React.FC<ActionPanelTitleProps> = (props) => {
  const styles = {
    base: css({
      fontSize: 12,
      boxSizing: 'border-box',
      backgroundColor: color.format(-0.03),
      padding: 5,
      paddingLeft: 8,
    }),
    label: css({
      color: COLORS.DARK,
      opacity: 0.6,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.label}>{props.children}</div>
    </div>
  );
};

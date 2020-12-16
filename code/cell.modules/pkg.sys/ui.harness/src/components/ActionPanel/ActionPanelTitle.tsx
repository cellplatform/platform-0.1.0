import React from 'react';
import { color, css, CssValue } from '../../common';

export type ActionPanelTitleProps = { style?: CssValue };

export const ActionPanelTitle: React.FC<ActionPanelTitleProps> = (props) => {
  const styles = {
    base: css({
      fontSize: 12,
      boxSizing: 'border-box',
      backgroundColor: color.format(-0.03),
      padding: 5,
      paddingLeft: 8,
      color: color.format(-0.6),
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.children}</div>;
};

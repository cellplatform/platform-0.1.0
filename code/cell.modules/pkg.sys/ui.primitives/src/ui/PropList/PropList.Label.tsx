import React from 'react';
import { color, css, CssValue, t, COLORS } from '../../common';

export type PropListLabelProps = {
  data: t.PropListItem;
  defaults: t.PropListDefaults;
  style?: CssValue;
};

export const PropListLabel: React.FC<PropListLabelProps> = (props) => {
  const styles = {
    base: css({
      userSelect: 'none',
      position: 'relative',
      marginRight: 15,
      color: color.alpha(COLORS.DARK, 0.4),
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.data.label}</div>;
};

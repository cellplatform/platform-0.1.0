import React from 'react';

import { color, css, CssValue } from '../../common';
import { Markdown } from '../Markdown';

export type LayoutTitleProps = {
  children?: React.ReactNode;
  style?: CssValue;
};

export const LayoutTitle: React.FC<LayoutTitleProps> = (props) => {
  const styles = {
    base: css({
      color: color.format(-0.4),
      fontSize: 11,
      marginTop: 5,
      marginLeft: 12,
      marginBottom: 1,
    }),
  };

  return <Markdown style={css(styles.base, props.style)}>{props.children}</Markdown>;
};

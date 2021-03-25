import React from 'react';
import { css, CssValue, defaultValue } from '../../common';

export type PropListTitleProps = {
  children?: React.ReactNode;
  ellipsis?: boolean;
  style?: CssValue;
};

export const PropListTitle: React.FC<PropListTitleProps> = (props) => {
  const ellipsis = defaultValue(props.ellipsis, true);

  const styles = {
    base: css({
      position: 'relative',
      width: '100%',
      flex: 1,
      fontWeight: 'bold',
      fontSize: 13,
    }),
    ellipsis: css({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
  };

  return (
    <div {...css(styles.base, ellipsis && styles.ellipsis, props.style)}>{props.children}</div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type TrayIconsProps = {
  items?: JSX.Element[];
  style?: CssValue;
};

export const TrayIcons: React.FC<TrayIconsProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      PaddingX: 15,
      Flex: 'x-center-center',
    }),
    item: css({
      position: 'relative',
      Size: 24,
      marginRight: 5,
      ':last-child': { margin: 0 },
      Flex: 'center-center',
    }),
  };

  const elItems = (props.items || []).map((el, i) => {
    return (
      <div key={i} {...styles.item}>
        {el}
      </div>
    );
  });

  return <div {...css(styles.base, props.style)}>{elItems}</div>;
};

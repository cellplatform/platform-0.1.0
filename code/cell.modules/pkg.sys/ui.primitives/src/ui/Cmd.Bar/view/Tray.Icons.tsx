import React from 'react';
import { css, CssValue } from '../common';

export type TrayIconsProps = {
  items?: JSX.Element[];
  style?: CssValue;
};

export const TrayIcons: React.FC<TrayIconsProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ PaddingX: 15, Flex: 'x-center-center' }),
    item: css({
      position: 'relative',
      Size: 24,
      marginRight: 5,
      ':last-child': { margin: 0 },
      Flex: 'center-center',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      {(props.items || []).map((el, i) => {
        return (
          <div key={i} {...styles.item}>
            {el}
          </div>
        );
      })}
    </div>
  );
};

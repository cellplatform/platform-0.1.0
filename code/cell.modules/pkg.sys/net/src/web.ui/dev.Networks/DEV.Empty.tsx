import React from 'react';

import { color, css, CssValue, Icons } from './DEV.common';

export type DevEmptyProps = {
  plural?: boolean;
  style?: CssValue;
};

export const DevEmpty: React.FC<DevEmptyProps> = (props) => {
  const { plural = true } = props;
  const message = plural ? `No networks to display` : `No network to display`;

  /**
   * [Render]
   */
  const styles = {
    base: css({ minWidth: 660, Flex: 'center-center' }),
    body: css({
      Flex: 'y-center-center',
      fontStyle: 'italic',
      fontSize: 12,
      opacity: 0.3,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <Icons.Antenna size={45} color={color.format(-0.3)} style={{ marginBottom: 6 }} />
        <div>{message}</div>
      </div>
    </div>
  );
};

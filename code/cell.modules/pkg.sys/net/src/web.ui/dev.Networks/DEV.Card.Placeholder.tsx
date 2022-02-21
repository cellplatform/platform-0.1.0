import React from 'react';
import { color, css, CssValue, t } from '../../common';

export type DevCardPlaceholderProps = { style?: CssValue };

export const DevCardPlaceholder: React.FC<DevCardPlaceholderProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'y-center-center',
      boxSizing: 'border-box',
      backgroundColor: color.format(-0.02),
      border: `solid 5px ${color.format(-0.05)}`,
      borderRadius: 20,
      width: 300,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div />
    </div>
  );
};

import React from 'react';
import { color, css, CssValue, t } from '../../common';

type Pixels = number;

export type DevCardPlaceholderProps = {
  backgroundBlur?: Pixels;
  style?: CssValue;
};

export const DevCardPlaceholder: React.FC<DevCardPlaceholderProps> = (props) => {
  const { backgroundBlur = 10 } = props;

  console.log('backgroundBlur', backgroundBlur);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'y-center-center',
      boxSizing: 'border-box',
      border: `solid 5px ${color.format(-0.05)}`,
      borderRadius: 20,
      width: 300,
      backgroundColor: color.format(-0.02),
      backdropFilter: `blur(${backgroundBlur}px)`,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div />
    </div>
  );
};

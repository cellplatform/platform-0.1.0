import React from 'react';
import { color, css, CssValue, t } from '../../common';

export type HarnessEmptyProps = { style?: CssValue };

export const HarnessEmpty: React.FC<HarnessEmptyProps> = (props) => {
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'center-center',
    }),
    body: css({
      color: color.format(-0.6),
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>No actions to display.</div>
    </div>
  );
};

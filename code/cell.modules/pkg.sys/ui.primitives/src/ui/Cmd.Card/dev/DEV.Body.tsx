import React from 'react';
import { Color, COLORS, css, CssValue, t } from '../common';

export type DevBodyProps = { style?: CssValue };

let renderCount = 0;

export const DevBody: React.FC<DevBodyProps> = (props) => {
  renderCount++;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', flex: 1 }),
    body: css({
      Absolute: 20,
      backgroundColor: 'rgba(255, 0, 0, 0.03)' /* RED */,
      border: `dashed 1px ${Color.alpha(COLORS.MAGENTA, 0.1)}`,
      borderRadius: 4,
      padding: 10,
    }),
    render: css({
      Absolute: [2, 4, null, null],
      fontSize: 10,
      opacity: 0.3,
      userSelect: 'none',
      color: COLORS.MAGENTA,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.render}>{`render-${renderCount}`}</div>
        <div>{`Sample Body`}</div>
      </div>
    </div>
  );
};

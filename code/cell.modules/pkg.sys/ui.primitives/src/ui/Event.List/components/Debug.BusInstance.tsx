import React from 'react';

import { color, COLORS, CONSTANTS, css, CssValue, t, rx } from '../common';

export type DebugBusInstanceProps = {
  bus: t.EventBus;
  style?: CssValue;
};

export const DebugBusInstance: React.FC<DebugBusInstanceProps> = (props) => {
  const { bus } = props;
  const styles = {
    base: css({
      Absolute: [-15, CONSTANTS.LIST.PADDING.RIGHT, null, null],
      fontFamily: 'monospace',
      fontSize: 10,
      color: color.alpha(COLORS.DARK, 0.6),
    }),
  };
  return <div {...css(styles.base, props.style)}>{rx.bus.instance(bus)}</div>;
};

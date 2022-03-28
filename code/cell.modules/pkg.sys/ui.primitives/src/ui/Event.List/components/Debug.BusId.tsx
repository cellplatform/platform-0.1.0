import React from 'react';
import { color, COLORS, css, CssValue, rx, t } from '../common';

export type DebugBusIdProps = {
  bus: t.EventBus<any>;
  debug: t.EventListDebugProps;
  style?: CssValue;
};

export const DebugBusId: React.FC<DebugBusIdProps> = (props) => {
  const { bus, debug } = props;
  const edge: t.EventListDebugEdge = typeof debug.busid === 'string' ? debug.busid : 'TopRight';

  const styles = {
    base: css({
      Absolute: toAbsolute(edge),
      color: color.alpha(COLORS.DARK, 0.6),
      fontSize: 10,
      fontFamily: 'monospace',
    }),
  };

  return <div {...css(styles.base, props.style)}>{rx.bus.instance(bus)}</div>;
};

/**
 * [Helpers]
 */

function toAbsolute(edge: t.EventListDebugEdge) {
  const OFFSET = -15;
  if (edge === 'TopLeft') return [OFFSET, null, null, 0];
  if (edge === 'TopRight') return [OFFSET, 0, null, null];
  if (edge === 'BottomLeft') return [null, null, OFFSET, 0];
  if (edge === 'BottomRight') return [null, 0, OFFSET, null];
  return;
}

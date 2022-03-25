import React, { useEffect, useRef, useState } from 'react';
import {
  rx,
  color,
  COLORS,
  css,
  CssValue,
  t,
  useResizeObserver,
  Icons,
  Button,
} from './DEV.common';

export type DevFullscreenProps = {
  children?: React.ReactNode;
  bus: t.EventBus<any>;
  instance: t.Id;
  style?: CssValue;
};

export const DevFullscreen: React.FC<DevFullscreenProps> = (props) => {
  const { instance } = props;
  const bus = rx.busAsType<t.NetworkCardEvent>(props.bus);

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0 }),
    bg: css({
      Absolute: 0,
      backgroundColor: color.format(0.1),
      backdropFilter: `blur(5px)`,
    }),
    body: css({ Absolute: 0 }),
    toolbar: css({
      Flex: 'x-center-spaceBetween',
      padding: 10,
    }),
  };

  const onClose = () => {
    bus.fire({
      type: 'sys.net/ui.NetworkCard/Overlay',
      payload: { instance, render: undefined },
    });
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.bg} />
      <div {...styles.body}>{props.children}</div>
      <div {...styles.toolbar}>
        <div />
        <div>
          <Button>
            <Icons.Close
              size={24}
              color={COLORS.WHITE}
              style={{ filter: `drop-shadow(0 1px 2px ${color.format(-0.6)})` }}
              onClick={onClose}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

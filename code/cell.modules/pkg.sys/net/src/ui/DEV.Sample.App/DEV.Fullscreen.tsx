import React from 'react';
import { rx, color, COLORS, css, CssValue, t, Icons, Button } from './DEV.common';

type Pixels = number;

export type DevFullscreenProps = {
  children?: React.ReactNode;
  bus: t.EventBus<any>;
  instance: t.Id;
  blur?: Pixels;
  style?: CssValue;
};

export const DevFullscreen: React.FC<DevFullscreenProps> = (props) => {
  const { instance, blur = 5 } = props;
  const bus = rx.busAsType<t.NetworkCardEvent>(props.bus);

  const TOOLBAR = { HEIGHT: 32, MARGIN: 10 };

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0 }),
    bg: css({
      Absolute: 0,
      backgroundColor: color.format(0.1),
      backdropFilter: `blur(${blur}px)`,
    }),
    body: css({ Absolute: 0 }),
    toolbar: css({
      Absolute: [TOOLBAR.MARGIN, TOOLBAR.MARGIN, null, TOOLBAR.MARGIN],
      height: TOOLBAR.HEIGHT,
      Flex: 'x-center-spaceBetween',
      boxSizing: 'border-box',
    }),
  };

  const onClose = () => {
    bus.fire({
      type: 'sys.net/ui.NetworkCard/Overlay',
      payload: { instance, render: undefined },
    });
  };

  const elToolbar = (
    <div {...styles.toolbar}>
      <div />
      <div>
        <Button>
          <Icons.Close
            size={TOOLBAR.HEIGHT}
            color={COLORS.WHITE}
            style={{ filter: `drop-shadow(0 1px 4px ${color.format(-0.3)})` }}
            onClick={onClose}
          />
        </Button>
      </div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.bg} />
      <div {...styles.body}>{props.children}</div>
      {elToolbar}
    </div>
  );
};

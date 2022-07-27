import React, { useState } from 'react';

import {
  Button,
  Color,
  COLORS,
  css,
  CssValue,
  Icons,
  rx,
  t,
  useResizeObserver,
  VideoStream,
} from './common';

export type DevVideoCardProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  stream?: MediaStream;
  style?: CssValue;
};

export const DevVideoCard: React.FC<DevVideoCardProps> = (props) => {
  const { stream } = props;
  const SIZE = 300;

  const network = props.instance.network;
  const instance = props.instance.id;
  const bus = rx.busAsType<t.NetworkCardEvent>(network.bus);

  const [isOver, setOver] = useState(false);
  const overHandler = (isOver: boolean) => () => setOver(isOver);

  /**
   * [Render]
   */
  const borderRadius = 20;
  const styles = {
    base: css({
      position: 'relative',
      width: SIZE,
      borderRadius,
      display: 'flex',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }),
    body: {
      base: css({ Absolute: 0 }),
      border: css({
        Absolute: 0,
        borderRadius,
        pointerEvents: 'none',
        border: `solid 3px ${Color.alpha(COLORS.DARK, 0.1)}`,
      }),
      mouseOverMask: css({
        Absolute: 0,
        pointerEvents: 'none',
        backgroundColor: Color.alpha(COLORS.DARK, 0.5),
        backdropFilter: `blur(18px)`,
        opacity: isOver ? 1 : 0,
        transition: `opacity 300ms`,
      }),
    },
    toolbar: {
      base: css({
        Absolute: [0, 10, null, 10],
        paddingRight: 3,
        borderBottom: `solid 1px ${Color.format(isOver ? 0.2 : 0)}`,
        transition: `border-color 300ms`,
        Flex: 'x-spaceBetween-stretch',
      }),
      section: css({ Flex: 'x-center-center', PaddingY: 10 }),
      button: css({ height: 20, marginRight: 15, ':last-child': { marginRight: 0 } }),
      icon: css({ filter: `drop-shadow(0 1px 4px ${Color.format(-0.2)})` }),
    },
  };

  const handleExpandWindowClick = () => {
    bus.fire({
      type: 'sys.net/ui.NetworkCard/Overlay',
      payload: {
        instance,
        render(e) {
          const { width, height } = e.size;
          return (
            <VideoStream
              stream={stream}
              width={width}
              height={height}
              borderRadius={0}
              isMuted={true}
            />
          );
        },
      },
    });
  };

  const handleCloseExpandedWindow = () => {
    bus.fire({
      type: 'sys.net/ui.NetworkCard/CloseChild',
      payload: { instance },
    });
  };

  const iconColor = Color.format(1);

  const elCloseButton = isOver && (
    <Button style={styles.toolbar.button} tooltip={'Close'}>
      <Icons.Close
        size={20}
        color={iconColor}
        style={styles.toolbar.icon}
        onClick={handleCloseExpandedWindow}
      />
    </Button>
  );

  const elToolbar = (
    <div {...styles.toolbar.base}>
      <div {...styles.toolbar.section}>{elCloseButton}</div>
      <div {...styles.toolbar.section}>
        {/* <Button style={styles.toolbar.button} tooltip={'Expand Window'}>
          <Icons.Window.Expand
            size={18}
            color={iconColor}
            style={styles.toolbar.icon}
            onClick={handleExpandWindowClick}
          />
        </Button> */}
      </div>
    </div>
  );

  const elVideo = stream && (
    <VideoStream
      stream={stream}
      width={SIZE}
      height={SIZE}
      borderRadius={[0, 0, 3, 3]}
      isMuted={true}
    />
  );

  const elBody = (
    <div {...styles.body.base}>
      {elVideo}
      <div {...styles.body.mouseOverMask} />
    </div>
  );

  const elBodyBorder = <div {...styles.body.border} />;

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={overHandler(true)}
      onMouseLeave={overHandler(false)}
    >
      {elBody}
      {elToolbar}
      {elBodyBorder}
    </div>
  );
};

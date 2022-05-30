import React from 'react';

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
} from './DEV.common';

export type DevVideoCardProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  stream?: MediaStream;
  style?: CssValue;
};

export const DevVideoCard: React.FC<DevVideoCardProps> = (props) => {
  const { stream } = props;

  const network = props.instance.network;
  const instance = props.instance.id;
  const bus = rx.busAsType<t.NetworkCardEvent>(network.bus);
  const resize = useResizeObserver();

  /**
   * [Render]
   */
  const borderRadius = 20;
  const styles = {
    base: css({
      position: 'relative',
      width: 300,
      borderRadius,
      display: 'flex',
      overflow: 'hidden',
    }),
    body: {
      base: css({ Absolute: 0 }),
      border: css({
        Absolute: 0,
        borderRadius,
        pointerEvents: 'none',
        border: `solid 3px ${Color.alpha(COLORS.DARK, 0.1)}`,
      }),
    },
    toolbar: {
      base: css({ Absolute: [0, 0, null, 0], Flex: 'x-spaceBetween-stretch' }),
      section: css({ Flex: 'x-center-center', padding: 10 }),
      button: css({ height: 20, marginRight: 15, ':last-child': { marginRight: 0 } }),
      icon: css({ filter: `drop-shadow(0 2px 5px ${Color.format(-0.5)})` }),
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

  const elToolbar = (
    <div {...styles.toolbar.base}>
      <div {...styles.toolbar.section}>
        <Button style={styles.toolbar.button} tooltip={'Close'}>
          <Icons.Close
            size={20}
            color={1}
            style={styles.toolbar.icon}
            onClick={handleCloseExpandedWindow}
          />
        </Button>
      </div>
      <div {...styles.toolbar.section}>
        <Button style={styles.toolbar.button} tooltip={'Expand Window'}>
          <Icons.Window.Expand
            size={18}
            color={1}
            style={styles.toolbar.icon}
            onClick={handleExpandWindowClick}
          />
        </Button>
      </div>
    </div>
  );

  const elVideo = stream && resize.ready && (
    <VideoStream
      stream={stream}
      width={resize.rect.width}
      height={resize.rect.height}
      borderRadius={[0, 0, 3, 3]}
      isMuted={true}
    />
  );

  const elBody = (
    <div ref={resize.ref} {...styles.body.base}>
      {elVideo}
    </div>
  );

  const elBodyBorder = <div {...styles.body.border} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elBody}
      {elToolbar}
      {/* <CardBody header={{ el: elHeader, height: 38, padding: [8, 8, 8, 12] }}>{elBody}</CardBody> */}
      {elBodyBorder}
    </div>
  );
};

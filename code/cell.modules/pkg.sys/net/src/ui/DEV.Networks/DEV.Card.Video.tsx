import React from 'react';

import {
  Button,
  Card,
  CardBody,
  css,
  CssValue,
  Icons,
  rx,
  t,
  useResizeObserver,
  VideoStream,
} from './DEV.common';

export type DevVideoCardProps = {
  instance: t.Id;
  network: t.PeerNetwork;
  stream?: MediaStream;
  style?: CssValue;
};

export const DevVideoCard: React.FC<DevVideoCardProps> = (props) => {
  const { network, stream, instance } = props;

  const bus = rx.busAsType<t.NetworkCardEvent>(network.bus);
  const resize = useResizeObserver();

  /**
   * [Render]
   */
  const styles = {
    base: css({ width: 300, display: 'flex' }),
    body: css({ flex: 1, position: 'relative' }),
    footer: {
      base: css({ flex: 1, Flex: 'x-center-center', fontSize: 13, PaddingY: 5 }),
      pipe: css({ flex: 1 }),
      footer: css({ fontSize: 14 }),
    },
    header: {},
    toolbar: {
      section: css({ Flex: 'x-center-center' }),
      button: css({
        height: 20,
        marginRight: 15,
        ':last-child': { marginRight: 0 },
      }),
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

  const handleStartScreenShare = () => {
    /**
     * TODO 🐷
     */
    console.log('🌳⚡️ StartScreenShare');
  };

  const elHeader = (
    <>
      <div {...styles.toolbar.section}>
        <Button style={styles.toolbar.button} tooltip={'Close'}>
          <Icons.Close size={20} onClick={handleCloseExpandedWindow} />
        </Button>
      </div>
      <div {...styles.toolbar.section}>
        <Button style={styles.toolbar.button} tooltip={'Start Screen Share'}>
          <Icons.ScreenShare.Start size={24} onClick={handleStartScreenShare} opacity={0.2} />
        </Button>
        <Button style={styles.toolbar.button} tooltip={'Expand Window'}>
          <Icons.Window.Expand size={20} onClick={handleExpandWindowClick} />
        </Button>
      </div>
    </>
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
    <div ref={resize.ref} {...styles.body}>
      {elVideo}
    </div>
  );

  const elFooter = (
    <div {...styles.footer}>
      <div>{'Footer'}</div>
    </div>
  );

  return (
    <Card style={css(styles.base, props.style)}>
      <CardBody header={{ el: elHeader, height: 38, padding: [8, 8, 8, 12] }}>{elBody}</CardBody>
    </Card>
  );
};

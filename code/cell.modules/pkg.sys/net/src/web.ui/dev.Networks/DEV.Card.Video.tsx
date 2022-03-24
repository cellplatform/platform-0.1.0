import React, { useRef } from 'react';

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

  const bodyRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(bodyRef);

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
      base: css({ Flex: 'x-center-center' }),
      body: css({}),
      button: css({ height: 20 }),
    },
  };

  const onFullScreenClick = () => {
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

  const onCloseChild = () => {
    bus.fire({
      type: 'sys.net/ui.NetworkCard/CloseChild',
      payload: { instance },
    });
  };

  const elHeader = (
    <>
      <div>{'Video'}</div>
      <div {...styles.toolbar.base}>
        <Button {...styles.toolbar.button}>
          <Icons.FullScreen.Open size={20} onClick={onFullScreenClick} />
        </Button>
        <Button {...styles.toolbar.button}>
          <Icons.Close size={20} onClick={onCloseChild} />
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
    <div ref={bodyRef} {...styles.body}>
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
      <CardBody
        header={{
          el: elHeader,
          height: 38,
          padding: [8, 8, 8, 12],
        }}
      >
        {elBody}
      </CardBody>
    </Card>
  );
};

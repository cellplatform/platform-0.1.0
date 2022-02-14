import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Card, CardBody, Button } from './DEV.common';

export type DevVideoCardProps = {
  network: t.PeerNetwork;
  style?: CssValue;
};

export const DevVideoCard: React.FC<DevVideoCardProps> = (props) => {
  const { network } = props;
  const self = network.netbus.self;

  /**
   * [Render]
   */
  const styles = {
    base: css({ width: 300, display: 'flex' }),
    body: css({ minHeight: 50, fontSize: 14 }),
    footer: {
      base: css({ flex: 1, Flex: 'x-center-center', fontSize: 13, PaddingY: 5 }),
      pipe: css({ flex: 1 }),
      footer: css({ fontSize: 14 }),
    },
  };

  const elHeader = (
    <>
      <div>{'Video'}</div>
      <div></div>
    </>
  );

  const connectVideo = async () => {
    const peer = network.events.peer;
    const status = await peer.status(self).get();
    const conn = status.peer?.connections[0];

    if (conn) {
      const parent = conn.id;
      const remote = conn.peer.remote.id;

      const f = peer.connection(self, remote).open.media('media/video', { parent });
      console.log('f', f);
      const ff = await f;
      console.log('ff', ff);
      console.log('network.status.current', network.status.current);
    }
  };

  const elBody = (
    <div {...styles.body}>
      <Button onClick={connectVideo}>Start Video</Button>
    </div>
  );

  const elFooter = (
    <div {...styles.footer}>
      <div>{'Footer'}</div>
    </div>
  );

  return (
    <Card style={css(styles.base, props.style)}>
      <CardBody padding={[18, 20, 15, 20]} header={elHeader} footer={elFooter}>
        {elBody}
      </CardBody>
    </Card>
  );
};

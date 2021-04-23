import React, { useEffect, useRef } from 'react';

import { PeerNetwork } from '../..';
import { Button, COLORS, css, CssValue, Hr, Icons, PropList, PropListItem, t } from '../common';
import { DevEventbus } from '../Event';
import { ItemUtil } from './util';

export type DevDataConnectionProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

export const DevDataConnection: React.FC<DevDataConnectionProps> = (props) => {
  const { connection, netbus, bus } = props;
  const peer = connection.peer;
  const { self, remote } = peer;

  const open = (kind: t.PeerConnectionKindMedia) => {
    return async () => {
      const parent = connection.id;
      const events = PeerNetwork.Events({ bus });
      await events.connection(self, remote).open.media(kind, { parent });
      events.dispose();
    };
  };

  const items: PropListItem[] = [
    ...ItemUtil.common(connection),
    { label: 'reliable', value: connection.isReliable },
    {
      label: 'media/video',
      value: <Button onClick={open('media/video')} label={'Start Video'} />,
    },
    {
      label: 'media/screen',
      value: <Button onClick={open('media/screen')} label={'Share Screen'} />,
    },
  ];

  const samplePayload = () => {
    return {
      peer: `...${peer.self.substring(peer.self.length - 10)}`,
      connection: connection.id,
    };
  };

  // Fire initial sample event through the network-bus.
  useEffect(() => {
    netbus.fire({ type: 'sample/loaded', payload: samplePayload() });
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      position: 'relative',
      padding: 12,
      paddingRight: 18,
    }),
    body: {
      base: css({
        position: 'relative',
      }),
      buttons: css({
        Flex: 'horizontal-center-spaceBetween',
        fontSize: 12,
        marginTop: 15,
      }),
      textbox: css({ MarginX: 20, fontSize: 12 }),
      events: {
        stack: css({ marginTop: 20 }),
        pipe: css({ marginTop: 15, MarginX: 15 }),
      },
    },
    drag: {
      overlay: css({ Absolute: 0, Flex: 'vertical-center-center' }),
      icon: css({ marginBottom: 6, opacity: 0.2 }),
    },
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body.base}>
        <PropList title={'Data Connection'} items={items} defaults={{ clipboard: false }} />
        <Hr thickness={5} opacity={0.1} margin={[10, 0, 15, 0]} />
        <DevEventbus
          bus={netbus}
          onBroadcast={(e) => {
            const msg = e.message ? e.message : `<empty>`;
            netbus.fire({
              // NB: Arbitrary invented event.
              //     When using in application, pass a set of strong event types to the bus.
              type: 'sample/event',
              payload: { msg, ...samplePayload() },
            });
          }}
        />
      </div>
    </div>
  );
};

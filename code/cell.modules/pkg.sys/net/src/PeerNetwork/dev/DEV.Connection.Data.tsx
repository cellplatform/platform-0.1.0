import { color } from '@platform/css';
import React, { useEffect, useRef, useState } from 'react';

import { Button, COLORS, css, CssValue, Hr, Icons, t, PropList, PropListItem } from './common';
import { EventStack } from './DEV.EventStack';
import { Textbox } from './DEV.primitives';
import { PeerNetwork } from '..';

export type ConnectionDataProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

const open = async (args: {
  bus: t.EventBus<any>;
  kind: t.PeerMediaKind;
  self: t.PeerId;
  remote: t.PeerId;
}) => {
  const { bus } = args;
  const events = PeerNetwork.Events({ bus });
  await events.connection(args.self, args.remote).open.media(args.kind);
  events.dispose();
};

export const ConnectionData: React.FC<ConnectionDataProps> = (props) => {
  const { connection, netbus, bus } = props;
  const peer = connection.peer;
  const { self, remote } = peer;

  const [eventCount, setEventCount] = useState<number>(0);
  const [eventMessage, setEventMessage] = useState<string>('');

  const items: PropListItem[] = [
    { label: 'id', value: { data: connection.id, clipboard: true } },
    { label: 'remote peer', value: { data: peer.remote, clipboard: true } },
    { label: 'open', value: connection.isOpen },
    { label: 'reliable', value: connection.isReliable },
    {
      label: 'media',
      value: {
        data: <Button>Start Video</Button>,
        onClick: () => open({ bus, self, remote, kind: 'video' }),
      },
    },
    {
      label: 'media',
      value: {
        data: <Button>Start Screen Share</Button>,
        onClick: () => open({ bus, self, remote, kind: 'screen' }),
      },
    },
  ];

  useEffect(() => {
    broadcastEvent(); // Fire initial sample netbus event.
  }, []); // eslint-disable-line

  const broadcastEvent = () => {
    const msg = eventMessage.trim() ? eventMessage : `<empty>`;
    setEventCount((prev) => prev + 1);
    netbus.fire({
      // NB: Arbitrary invented event.
      // When using in application, pass a set of strong event types to the bus.
      type: 'sample/event',
      payload: { msg, from: peer.self, count: eventCount },
    });
  };

  const styles = {
    base: css({}),
    buttons: css({
      Flex: 'horizontal-center-spaceBetween',
      fontSize: 12,
      marginTop: 15,
    }),
    events: css({ marginTop: 20 }),
    textbox: css({ MarginX: 20, fontSize: 12 }),
  };

  const elTextbox = (
    <Textbox
      value={eventMessage}
      placeholder={'broadcast event'}
      onChange={(e) => setEventMessage(e.to)}
      style={styles.textbox}
      enter={{
        handler: broadcastEvent,
        icon: (
          <Icons.Send
            size={16}
            color={eventMessage.trim() ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.3)}
          />
        ),
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Data Connection'} items={items} defaults={{ clipboard: false }} />
      <Hr thickness={5} opacity={0.1} margin={[10, 0, 15, 0]} />
      {elTextbox}
      <EventStack bus={netbus} style={styles.events} />
    </div>
  );
};

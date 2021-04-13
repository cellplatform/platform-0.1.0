import { color } from '@platform/css';
import React, { useEffect, useState } from 'react';

import {
  Textbox,
  Button,
  COLORS,
  css,
  CssValue,
  Hr,
  Icons,
  t,
  PropList,
  PropListItem,
} from './common';
import { EventStack, useEventBusHistory, EventPipe } from 'sys.ui.primitives/lib/components/Event';

import { PeerNetwork } from '..';

export type ConnectionDataProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

const fireOpen = async (args: {
  bus: t.EventBus<any>;
  kind: t.PeerConnectionKindMedia;
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

  const [eventMessage, setEventMessage] = useState<string>('');

  const history = useEventBusHistory({ bus });

  const open = (kind: t.PeerConnectionKindMedia) => {
    return () => fireOpen({ bus, self, remote, kind });
  };

  const items: PropListItem[] = [
    { label: 'id', value: { data: connection.id, clipboard: true } },
    { label: 'remote peer', value: { data: peer.remote, clipboard: true } },
    { label: 'kind', value: connection.kind },
    { label: 'open', value: connection.isOpen },
    { label: 'reliable', value: connection.isReliable },
    {
      label: 'video',
      value: <Button onClick={open('media/video')} label={'Start Video'} />,
    },
    {
      label: 'screen',
      value: <Button onClick={open('media/screen')} label={'Share Screen'} />,
    },
  ];

  // Fire initial sample event through the network-bus.
  useEffect(() => broadcastEvent(), []); // eslint-disable-line

  const broadcastEvent = () => {
    const msg = eventMessage.trim() ? eventMessage : `<empty>`;
    netbus.fire({
      // NB: Arbitrary invented event.
      // When using in application, pass a set of strong event types to the bus.
      type: 'sample/event',
      payload: {
        msg,
        peer: `...${peer.self.substring(peer.self.length - 10)}`,
        connection: connection.id,
      },
    });
  };

  const styles = {
    base: css({}),
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
  };

  const elTextbox = (
    <Textbox
      value={eventMessage}
      placeholder={'broadcast event'}
      onChange={(e) => setEventMessage(e.to)}
      style={styles.textbox}
      enter={{
        handler: broadcastEvent,
        icon: (e) => {
          const msg = eventMessage.trim();
          const col = msg || e.isFocused ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.3);
          const el = <Icons.Send size={16} color={col} />;
          return el;
        },
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Data Connection'} items={items} defaults={{ clipboard: false }} />
      <Hr thickness={5} opacity={0.1} margin={[10, 0, 15, 0]} />
      {elTextbox}
      <EventStack events={history.events} style={styles.events.stack} />
      <EventPipe events={history.events} style={styles.events.pipe} />
    </div>
  );
};

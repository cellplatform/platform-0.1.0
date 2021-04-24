import { color } from '@platform/css';
import React, { useEffect, useState } from 'react';

import {
  COLORS,
  css,
  CssValue,
  EventBusHistory,
  EventPipe,
  EventStack,
  Icons,
  t,
  Textbox,
  PeerNetwork,
} from '../common';

export type DevEventbusOnBroadcastEvent = { message: string };
export type DevEventBusOnBroadcastEventHandler = (e: DevEventbusOnBroadcastEvent) => void;

export type DevEventBusProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  history: EventBusHistory;
  canBroadcast?: boolean;
  style?: CssValue;
};

export const DevEventBus: React.FC<DevEventBusProps> = (props) => {
  const { canBroadcast, history, self } = props;
  const bus = props.bus;

  const styles = {
    base: css({ position: 'relative' }),
    textbox: css({ MarginX: 20, fontSize: 12, marginBottom: 10 }),
    stack: css({ marginTop: 20 }),
    pipe: css({ marginTop: 15, MarginX: 15 }),
  };

  const [filter, setFilter] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // NB: Arbitrary invented event.
  //     When using in application, pass a set of strong event types to the bus.
  const broadcastEvent = async () => {
    if (!canBroadcast) return;

    let msg = message.trim();
    msg = msg ? msg : `<empty>`;

    const events = PeerNetwork.Events(bus);
    const data = events.data(self);

    const event = { type: 'sample/event', payload: { msg } };

    const res = await data.send(event, {
      target: (e) => {
        const text = filter.trim();
        return !text
          ? true
          : text
              .split(',')
              .map((text) => text.trim())
              .some((text) => e.peer.endsWith(text) || e.connection.id.endsWith(text));
      },
    });

    events.dispose();
  };

  const elFilter = canBroadcast && (
    <Textbox
      value={filter}
      placeholder={'target filter: peer/connection'}
      onChange={(e) => setFilter(e.to)}
      style={styles.textbox}
    />
  );

  const elMessage = canBroadcast && (
    <Textbox
      value={message}
      placeholder={'broadcast sample event'}
      onChange={(e) => setMessage(e.to)}
      style={styles.textbox}
      enter={{
        handler: broadcastEvent,
        icon: (e) => {
          const msg = message.trim();
          const col = msg || e.isFocused ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.3);
          const el = <Icons.Send size={16} color={col} />;
          return el;
        },
      }}
    />
  );

  const body = history.total > 0 && (
    <>
      <EventStack
        events={history.events}
        card={{ duration: 150, title: 'Event' }}
        style={styles.stack}
      />
      <EventPipe
        events={history.events}
        style={styles.pipe}
        onEventClick={(e) => {
          console.group('🌳 event');
          console.log('count', e.count);
          console.log('type', e.event.type);
          console.log('payload', e.event.payload);
          console.groupEnd();
        }}
      />
    </>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elFilter}
      {elMessage}
      {body}
    </div>
  );
};

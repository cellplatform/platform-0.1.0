import { color } from '@platform/css';
import React, { useState, useEffect } from 'react';

import {
  COLORS,
  css,
  CssValue,
  EventPipe,
  EventStack,
  Icons,
  t,
  Textbox,
  useEventBusHistory,
} from '../common';

export type DevEventbusOnBroadcastEvent = {
  bus: t.EventBus<any>;
  message: string;
};
export type DevEventbusOnBroadcastEventHandler = (e: DevEventbusOnBroadcastEvent) => void;

export type DevEventbusProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
  onBroadcast?: DevEventbusOnBroadcastEventHandler;
};

export const DevEventbus: React.FC<DevEventbusProps> = (props) => {
  const bus = props.bus;
  const history = useEventBusHistory(bus);

  const styles = {
    base: css({ position: 'relative' }),
    textbox: css({ MarginX: 20, fontSize: 12 }),
    stack: css({ marginTop: 20 }),
    pipe: css({ marginTop: 15, MarginX: 15 }),
  };

  const [eventMessage, setEventMessage] = useState<string>('');

  const broadcastEvent = () => {
    if (props.onBroadcast) {
      const message = eventMessage.trim() ? eventMessage : `<empty>`;
      props.onBroadcast({ bus, message });
    }
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

  const body = history.total > 0 && (
    <>
      {elTextbox}
      <EventStack events={history.events} style={styles.stack} />
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

  return <div {...css(styles.base, props.style)}>{body}</div>;
};

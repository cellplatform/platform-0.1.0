import { color } from '@platform/css';
import React, { useEffect, useRef, useState } from 'react';

import { PeerNetwork } from '../..';
import {
  Button,
  COLORS,
  css,
  CssValue,
  EventPipe,
  EventStack,
  Hr,
  Icons,
  PropList,
  PropListItem,
  t,
  Textbox,
  useDragTarget,
  useEventBusHistory,
} from '../common';
import { ItemUtil } from './util';

export type DevConnectionDataProps = {
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

export const DevConnectionData: React.FC<DevConnectionDataProps> = (props) => {
  const { connection, netbus, bus } = props;
  const peer = connection.peer;
  const { self, remote } = peer;

  const [eventMessage, setEventMessage] = useState<string>('');
  const history = useEventBusHistory(netbus);

  const baseRef = useRef<HTMLDivElement>(null);
  const drag = useDragTarget(baseRef, (e) => {
    console.log('file dropped', e);
  });

  const open = (kind: t.PeerConnectionKindMedia) => {
    return () => fireOpen({ bus, self, remote, kind });
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

  // Fire initial sample event through the network-bus.
  useEffect(() => broadcastEvent(), []); // eslint-disable-line

  const broadcastEvent = () => {
    const msg = eventMessage.trim() ? eventMessage : `<empty>`;
    netbus.fire({
      // NB: Arbitrary invented event.
      //     When using in application, pass a set of strong event types to the bus.
      type: 'sample/event',
      payload: {
        msg,
        peer: `...${peer.self.substring(peer.self.length - 10)}`,
        connection: connection.id,
      },
    });
  };

  const styles = {
    base: css({
      position: 'relative',
      padding: 12,
      paddingRight: 18,
    }),
    body: {
      base: css({
        position: 'relative',
        filter: drag.isDragOver ? `blur(3px)` : undefined,
        opacity: drag.isDragOver ? 0.3 : 1,
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

  const elTextbox = (
    <Textbox
      value={eventMessage}
      placeholder={'broadcast event'}
      onChange={(e) => setEventMessage(e.to)}
      style={styles.body.textbox}
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

  const elDragOverlay = drag.isDragOver && (
    <div {...styles.drag.overlay}>
      <Icons.Upload.Box size={46} style={styles.drag.icon} color={COLORS.DARK} />
      <div>Drop File</div>
    </div>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <div {...styles.body.base}>
        <PropList title={'Data Connection'} items={items} defaults={{ clipboard: false }} />
        <Hr thickness={5} opacity={0.1} margin={[10, 0, 15, 0]} />
        {elTextbox}
        <EventStack events={history.events} style={styles.body.events.stack} />
        <EventPipe
          events={history.events}
          style={styles.body.events.pipe}
          onEventClick={(e) => {
            console.group('🌳 event');
            console.log('count', e.count);
            console.log('type', e.event.type);
            console.log('payload', e.event.payload);
            console.groupEnd();
          }}
        />
      </div>
      {elDragOverlay}
    </div>
  );
};

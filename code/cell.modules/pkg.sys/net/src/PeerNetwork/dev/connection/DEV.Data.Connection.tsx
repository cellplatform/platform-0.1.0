import React, { useEffect, useRef } from 'react';

import {
  Button,
  css,
  CssValue,
  EventPipe,
  PeerNetwork,
  PropList,
  PropListItem,
  t,
  useEventBusHistory,
} from '../common';
import { openHandler, PropUtil } from './util';

export type DevDataConnectionProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

export const DevDataConnection: React.FC<DevDataConnectionProps> = (props) => {
  const { self, connection, bus, netbus } = props;

  const history = useEventBusHistory(bus, {
    filter: (args) => {
      const e = args as t.PeerEvent;
      if (e.type !== 'sys.net/peer/data/in') return false;
      return true;
    },
  });

  const open = (kind: t.PeerConnectionKindMedia) => openHandler({ bus, connection, kind });

  const mainItems: PropListItem[] = [
    ...PropUtil.common(connection),
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

  const strategyItems: PropListItem[] = [
    {
      label: 'group.connections',
      value: (
        <Button
          label={'Run'}
          onClick={async () => {
            const events = PeerNetwork.GroupEvents({ self, bus: netbus });
            console.log('fire', events);

            const res = await events.connections().get();
            //
            // bus.fire({type:'sys.net/group/connections:req'})
          }}
        />
      ),
    },
  ];

  const styles = {
    base: css({
      position: 'relative',
      padding: 12,
      paddingRight: 18,
    }),
    body: {
      base: css({ position: 'relative' }),
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
        <PropList title={'Data Connection'} items={mainItems} defaults={{ clipboard: false }} />
        <EventPipe
          events={history.events}
          style={{ MarginY: 10 }}
          onEventClick={(item) => {
            const e = item.event.payload as t.PeerDataIn;
            console.group('🌳 Distributed Event (Incoming)');
            console.log('source.peer', e.source.peer);
            console.log('event', e.data);
            console.groupEnd();
          }}
        />
        <PropList title={'Strategy'} items={strategyItems} defaults={{ clipboard: false }} />
      </div>
    </div>
  );
};

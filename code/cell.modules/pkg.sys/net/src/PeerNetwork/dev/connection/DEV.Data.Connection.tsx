import React, { useEffect, useRef, useState } from 'react';

import {
  Button,
  css,
  CssValue,
  EventPipe,
  PeerNetwork,
  PropList,
  PropListItem,
  Hr,
  t,
  useEventBusHistory,
} from '../common';
import { openHandler, PropUtil } from './util';

export type DevDataConnectionProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

export const DevDataConnection: React.FC<DevDataConnectionProps> = (props) => {
  const { self, connection, bus, netbus } = props;

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
        {/* <Hr thickness={5} opacity={0.1} margin={[10, 0]} /> */}
        {/* <EventPipe
          events={history.events}
          style={{ MarginY: 10 }}
          onEventClick={(item) => {
            console.log('event', item.event);
          }}
        /> */}
      </div>
    </div>
  );
};

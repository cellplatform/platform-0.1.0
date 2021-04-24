import React, { useEffect, useRef } from 'react';

import { Button, css, CssValue, Hr, PropList, PropListItem, t, time, PeerNetwork } from '../common';
import { PropUtil, openHandler } from './util';

export type DevDataConnectionProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionDataStatus;
  style?: CssValue;
};

export const DevDataConnection: React.FC<DevDataConnectionProps> = (props) => {
  const { connection, bus } = props;

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
          onClick={() => {
            const events = PeerNetwork.Events(bus);
            console.log('fire', events);
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
        <Hr thickness={5} opacity={0.1} margin={[10, 0]} />
        <PropList title={'Strategy'} items={strategyItems} defaults={{ clipboard: false }} />
      </div>
    </div>
  );
};

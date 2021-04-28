import React, { useEffect, useRef, useState } from 'react';

import {
  css,
  CssValue,
  Hr,
  PropList,
  PropListItem,
  t,
  useEventBusHistory,
  PeerNetwork,
  Dropped,
  color,
} from '../common';
import { DevCard } from '../DEV.Card';
import { DevEventBusStack } from './DEV.EventBus.Stack';
import { DevEventBusTextbox } from './DEV.EventBus.Textbox';
import { DevThumbnails } from './DEV.Thumbnails';

export type DevEventBusCardProps = {
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const DevEventBusCard: React.FC<DevEventBusCardProps> = (props) => {
  const { bus, netbus } = props;
  const self = netbus.self;

  const history = useEventBusHistory(netbus);

  const handleBroadcast = async (args: { message: string; filter: string }) => {
    if (!netbus) return;

    const msg = args.message.trim();
    const event = { type: 'sample/event', payload: { msg: msg || `<empty>` } };

    const filter: t.PeerFilter = (e) => {
      const text = args.filter.trim();
      return !text
        ? true
        : text
            .split(',')
            .map((text) => text.trim())
            .some((text) => e.peer.endsWith(text) || e.connection.id.endsWith(text));
    };

    if (!args.filter) netbus.fire(event);
    if (args.filter) {
      const res = await netbus.target.filter(filter).fire(event);
      console.log('response (filtered):', res);
    }
  };

  const handleDrop = (e: Dropped) => {
    if (netbus) {
      const events = PeerNetwork.GroupEvents(netbus);
      events.fs().fire(e);
      events.dispose();
    }
  };

  const styles = {
    base: css({
      position: 'relative',
      padding: 12,
      paddingBottom: 15,
    }),
    thumbnails: css({ marginTop: 10 }),
  };

  const items: PropListItem[] = [{ label: 'total events', value: history.total }];

  return (
    <DevCard margin={props.margin} style={props.style} onDrop={handleDrop}>
      <div {...styles.base}>
        <PropList title={'Network Bus'} items={items} defaults={{ clipboard: false }} />
        <Hr thickness={5} opacity={0.1} margin={[10, 0, 15, 0]} />
        <DevEventBusTextbox onBroadcast={handleBroadcast} />
        <DevEventBusStack history={history} />
        <DevThumbnails bus={bus} netbus={netbus} style={{ marginTop: 10 }} />
      </div>
    </DevCard>
  );
};

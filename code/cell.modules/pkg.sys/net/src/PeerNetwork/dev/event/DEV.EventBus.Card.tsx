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
} from '../common';
import { DevCard } from '../DEV.Card';
import { DevEventBusStack } from './DEV.EventBus.Stack';
import { DevEventBusTextbox } from './DEV.EventBus.Textbox';

export type DevEventBusCardProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const DevEventBusCard: React.FC<DevEventBusCardProps> = (props) => {
  const { self, bus } = props;

  const [netbus, setNetbus] = useState<t.NetBus>();
  useEffect(() => setNetbus(PeerNetwork.NetBus({ self, bus })), [self, bus]);

  const history = useEventBusHistory(netbus);

  const handleBroadcast = async (args: { message: string; filter: string }) => {
    if (!netbus) return;

    const msg = args.message.trim();
    const event = { type: 'sample/event', payload: { msg: msg || `<empty>` } };

    const filter: t.PeerConnectionFilter = (e) => {
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

  const styles = {
    base: css({
      position: 'relative',
      padding: 12,
      paddingBottom: 15,
    }),
  };

  const items: PropListItem[] = [{ label: 'total', value: history.total }];

  return (
    <DevCard margin={props.margin} style={props.style}>
      <div {...styles.base}>
        <PropList title={'Network Bus'} items={items} defaults={{ clipboard: false }} />
        <Hr thickness={5} opacity={0.1} margin={[10, 0, 15, 0]} />
        <DevEventBusTextbox onBroadcast={handleBroadcast} />
        <DevEventBusStack history={history} />
      </div>
    </DevCard>
  );
};

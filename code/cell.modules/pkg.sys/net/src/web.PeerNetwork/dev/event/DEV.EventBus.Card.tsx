import React from 'react';

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
  FileUtil,
  Uri,
} from '../common';
import { DevCard } from '../layouts';
import { DevEventBusStack } from './DEV.EventBus.Stack';
import { DevEventBusTextbox } from './DEV.EventBus.Textbox';
// import { DevImageThumbnails } from '../media';

export type DevEventBusCardProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const DevEventBusCard: React.FC<DevEventBusCardProps> = (props) => {
  const { bus, netbus } = props;
  const history = useEventBusHistory(netbus);

  const handleBroadcast = async (args: { message: string; filter: string }) => {
    if (!netbus) return;

    const msg = args.message.trim();
    const event = { type: 'sample/event', payload: { msg: msg ?? `<empty>` } };

    const filter: t.NetworkBusFilter = (e) => {
      const text = args.filter.trim();
      if (!text) return true; // NB: no filter applied.

      return text
        .split(',')
        .map((text) => text.trim())
        .some((text) => {
          if (Uri.is.peer(e.uri) && e.uri.endsWith(text)) return true;
          const uri = Uri.connection.parse(e.uri);
          return uri?.peer.endsWith(text) || uri?.connection.endsWith(text);
        });
    };

    if (!args.filter) netbus.fire(event);
    if (args.filter) {
      const res = await netbus.target.filter(filter).fire(event);
      console.log('response (filtered):', res);
    }
  };

  const styles = {
    base: css({ position: 'relative', padding: 12, paddingBottom: 15 }),
    thumbnails: css({ marginTop: 10 }),
  };

  const items: PropListItem[] = [{ label: 'total events', value: history.total }];

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

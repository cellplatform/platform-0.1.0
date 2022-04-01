import React from 'react';

import {
  Card,
  css,
  CssValue,
  Hr,
  PropList,
  PropListItem,
  Style,
  UriUtil,
  t,
  useEventHistory,
} from '../DEV.common';
import { DevEventBusStack } from './DEV.NetbusCard.Stack';
import { DevEventBusTextbox } from './DEV.NetbusCard.Textbox';

export type DevNetbusCardProps = {
  netbus: t.PeerNetbus<any>;
  showAsCard?: boolean | { padding?: t.CssEdgesInput };
  style?: CssValue;
  margin?: t.CssEdgesInput;
};

export const DevNetbusCard: React.FC<DevNetbusCardProps> = (props) => {
  const { showAsCard = true, netbus } = props;
  const history = useEventHistory(netbus);
  const items: PropListItem[] = [{ label: 'total events', value: history.total }];

  /**
   * Event Handlers
   */

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
          if (UriUtil.is.peer(e.uri) && e.uri.endsWith(text)) return true;
          const uri = UriUtil.connection.parse(e.uri);
          return uri?.peer.endsWith(text) || uri?.connection.endsWith(text);
        });
    };

    if (!args.filter) netbus.fire(event);
    if (args.filter) {
      const res = await netbus.target.filter(filter).fire(event);
      console.log('response (filtered):', res);
    }
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    body: css({ position: 'relative', minWidth: 300 }),
  };

  const elBody = (
    <div {...styles.body}>
      <PropList title={'Network Bus'} items={items} defaults={{ clipboard: false }} />
      <Hr thickness={5} opacity={0.1} margin={[10, 0, 15, 0]} />
      <DevEventBusTextbox onBroadcast={handleBroadcast} />
      <DevEventBusStack history={history.events} />
    </div>
  );

  if (showAsCard) {
    const padding =
      typeof showAsCard === 'object'
        ? { ...Style.toPadding(showAsCard.padding) }
        : { Padding: [18, 20, 15, 20] };
    return (
      <Card style={css(styles.base, padding, props.style)} margin={props.margin}>
        {elBody}
      </Card>
    );
  } else {
    return (
      <div {...css(styles.base, { ...Style.toMargins(props.margin) }, props.style)}>{elBody}</div>
    );
  }
};

import React, { useEffect, useRef, useState } from 'react';

import {
  css,
  CssValue,
  EventBusHistory,
  Hr,
  PropList,
  PropListItem,
  t,
  useEventBusHistory,
} from '../common';
import { DevCard } from '../DEV.Card';
import { DevEventBus } from '../event';

export type DevEventBusCardProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const DevEventBusCard: React.FC<DevEventBusCardProps> = (props) => {
  const { self, bus, netbus } = props;
  const history = useEventBusHistory(netbus);

  const styles = {
    base: css({
      position: 'relative',
      padding: 12,
      paddingBottom: 15,
    }),
  };

  const items: PropListItem[] = [];

  return (
    <DevCard margin={props.margin} style={props.style}>
      <div {...styles.base}>
        <PropList title={'Network Bus'} items={items} defaults={{ clipboard: false }} />
        <Hr thickness={5} opacity={0.1} margin={[10, 0, 15, 0]} />
        <DevEventBus self={self} bus={bus} netbus={netbus} canBroadcast={true} history={history} />
      </div>
    </DevCard>
  );
};

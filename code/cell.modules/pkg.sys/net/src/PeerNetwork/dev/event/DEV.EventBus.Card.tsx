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
  bus: t.EventBus<any>;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const DevEventBusCard: React.FC<DevEventBusCardProps> = (props) => {
  const { bus } = props;
  const history = useEventBusHistory(bus);

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

        <DevEventBus
          bus={bus}
          canBroadcast={true}
          history={history}
          onBroadcast={(e) => {
            // NB: Arbitrary invented event.
            //     When using in application, pass a set of strong event types to the bus.
            const msg = e.message ? e.message : `<empty>`;
            bus.fire({ type: 'sample/event', payload: { msg } });
          }}
        />
      </div>
    </DevCard>
  );
};

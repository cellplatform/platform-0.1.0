import React, { useEffect, useRef, useState } from 'react';
import {
  slug,
  color,
  css,
  CssValue,
  t,
  Card,
  CardStack,
  CardStackItem,
  PropList,
  PropListItem,
} from '../common';
import { DevCard } from '../DEV.Card';

export type DevDataConnectionsProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connections: t.PeerConnectionDataStatus[];
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const DevDataConnections: React.FC<DevDataConnectionsProps> = (props) => {
  const { bus, netbus, connections } = props;
  const styles = { base: css({}) };

  const handleClose = () => {
    connections.forEach((connection) => {
      const { self, remote } = connection.peer;
      bus.fire({
        type: 'sys.net/peer/conn/disconnect:req',
        payload: { self, remote, connection: connection.id },
      });
    });
  };

  const items: CardStackItem[] = connections.map(() => {
    return {
      id: slug(),
      el(e) {
        if (!e.is.top) return <Card margin={props.margin} width={300} shadow={false} />;
        return (
          <DevCard margin={props.margin} onClose={handleClose}>
            <Body bus={bus} netbus={netbus} connections={connections} />
          </DevCard>
        );
      },
    };
  });

  return (
    <div {...css(styles.base, props.style)}>
      <CardStack items={items} />
    </div>
  );
};

type BodyProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connections: t.PeerConnectionDataStatus[];
};
const Body: React.FC<BodyProps> = () => {
  const styles = {
    base: css({ position: 'relative', padding: 12, paddingRight: 18 }),
  };

  return (
    <div {...styles.base}>
      <div>Body</div>
    </div>
  );
};

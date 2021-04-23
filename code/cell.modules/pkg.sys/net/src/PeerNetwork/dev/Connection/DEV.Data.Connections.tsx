import React, { useEffect, useRef, useState } from 'react';

import {
  Button,
  Card,
  CardStack,
  CardStackItem,
  css,
  CssValue,
  Hr,
  PropList,
  PropListItem,
  t,
} from '../common';
import { DevCard } from '../DEV.Card';
import { DevNetworkConnectionsModal } from '../Network/';
import { openHandler } from './util';

export type DevDataConnectionsProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connections: t.PeerConnectionDataStatus[];
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const DevDataConnections: React.FC<DevDataConnectionsProps> = (props) => {
  const { bus, netbus, connections, self } = props;
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

  const stack: CardStackItem[] = connections.map((item) => {
    return {
      id: item.id,
      el(e) {
        if (!e.is.top) return <Card margin={props.margin} width={300} shadow={false} />;
        return (
          <DevCard margin={props.margin} onClose={handleClose}>
            <Body self={self} bus={bus} netbus={netbus} connections={connections} />
          </DevCard>
        );
      },
    };
  });

  return (
    <div {...css(styles.base, props.style)}>
      <CardStack items={stack} maxDepth={3} />
    </div>
  );
};

/**
 * Card body.
 */
type BodyProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connections: t.PeerConnectionDataStatus[];
};
const Body: React.FC<BodyProps> = (props) => {
  const { netbus, connections, self } = props;
  const bus = props.bus.type<t.DevEvent>();

  const styles = {
    base: css({ position: 'relative', padding: 12, paddingRight: 18, fontSize: 12 }),
    footer: css({ Flex: 'horizontal-stretch-spaceBetween' }),
  };

  const items: PropListItem[] = connections.map((connection, i) => {
    const open = (kind: t.PeerConnectionKindMedia) => openHandler({ bus, connection, kind });
    const value = (
      <>
        <Button label={'video'} onClick={open('media/video')} margin={[null, 8, null, null]} />
        <Button label={'screen'} onClick={open('media/screen')} />
      </>
    );
    return { label: connection.id, value };
  });

  return (
    <div {...styles.base}>
      <PropList title={'Data Connections'} items={items} />

      <Hr thickness={5} opacity={0.1} margin={[10, 0, 10, 0]} />
      <div {...styles.footer}>
        <div />
        <Button
          label={'Expand'}
          onClick={() => {
            const el = (
              <DevNetworkConnectionsModal
                self={self}
                bus={bus}
                netbus={netbus}
                filter={(e) => e.kind === 'data'}
              />
            );
            bus.fire({ type: 'DEV/modal', payload: { el, target: 'body' } });
          }}
        />
      </div>
    </div>
  );
};

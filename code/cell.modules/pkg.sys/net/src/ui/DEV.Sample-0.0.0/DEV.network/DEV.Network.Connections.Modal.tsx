import React, { useEffect } from 'react';
import { filter, map } from 'rxjs/operators';

import { COLORS, PeerNetwork, t, css, color, Icons, Button } from '../DEV.common';
import { DevModal } from '../DEV.layouts';
import { DevNetworkConnections, DevNetworkConnectionsProps } from './DEV.Network.Connections';

export type DevNetworkConnectionsModalProps = {
  children?: React.ReactNode;
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  header?: { title: React.ReactNode };
  filter?: DevNetworkConnectionsProps['filter'];
};

export const DevNetworkConnectionsModal: React.FC<DevNetworkConnectionsModalProps> = (props) => {
  const { netbus, self } = props;
  const bus = props.bus as t.EventBus<t.DevEvent>;

  useEffect(() => {
    const events = PeerNetwork.PeerEvents(bus);
    const status$ = events.status(self).changed$.pipe(map((e) => e.peer));

    // Remove modal when all connections have been closed.
    status$.pipe(filter((e) => e.connections.length === 0)).subscribe((e) => {
      bus.fire({ type: 'DEV/modal', payload: { el: undefined } });
    });

    return () => events.dispose();
  }, [bus, self]);

  const headerHeight = 44;

  return (
    <DevModal bus={bus} background={1}>
      <DevNetworkConnections
        bus={bus}
        netbus={netbus}
        collapse={false}
        filter={props.filter}
        paddingTop={headerHeight}
      />
      <Header bus={bus} height={headerHeight}>
        {props.header?.title || 'Untitled'}
      </Header>
    </DevModal>
  );
};

/**
 * Modal header.
 */
type HeaderProps = {
  children?: React.ReactNode;
  bus: t.EventBus<any>;
  height: number;
};

const Header: React.FC<HeaderProps> = (props) => {
  const { height } = props;
  const bus = props.bus as t.EventBus<t.DevEvent>;
  const SIZE = { BACK: 32 };

  const styles = {
    base: css({
      Absolute: [0, 10, null, 0],
      backgroundColor: color.format(0.8),
      backdropFilter: `blur(5px)`,
      height,
    }),
    body: css({
      Flex: 'horizontal-center-start',
      boxSizing: 'border-box',
      padding: 5,
      fontSize: 16,
    }),
    back: css({
      position: 'relative',
      top: -1,
      Size: SIZE.BACK,
      marginRight: 8,
    }),
  };

  const handleClose = () => bus.fire({ type: 'DEV/modal', payload: {} });

  return (
    <div {...styles.base}>
      <div {...styles.body}>
        <Button style={styles.back} onClick={handleClose}>
          <Icons.Arrow.Back size={SIZE.BACK} color={color.alpha(COLORS.DARK, 0.6)} />
        </Button>
        {props.children}
      </div>
    </div>
  );
};

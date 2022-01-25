import React, { useEffect, useRef, useState } from 'react';

import { Button, css, CssValue, Hr, PropList, PropListItem, t } from '../common';
import { DevNetworkConnectionsModal } from '../network/';

/**
 * Card body.
 */
export type DevMediaConnectionsProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  connections: t.PeerConnectionMediaStatus[];
  style?: CssValue;
};
export const DevMediaConnections: React.FC<DevMediaConnectionsProps> = (props) => {
  const { netbus, connections } = props;
  const bus = props.bus as t.EventBus<t.DevEvent>;
  const self = netbus.self;

  const styles = {
    base: css({ position: 'relative', padding: 12, fontSize: 12 }),
    footer: css({ Flex: 'horizontal-stretch-spaceBetween' }),
    value: {
      base: css({ Flex: 'horizontal-center-center' }),
      label: css({ display: 'inline-block', marginRight: 8, opacity: 0.5 }),
    },
  };

  const items: PropListItem[] = connections.map((connection, i) => {
    return { label: connection.id, value: connection.kind };
  });

  const handleExpandClick = () => {
    const el = (
      <DevNetworkConnectionsModal
        self={self}
        bus={bus}
        netbus={netbus}
        header={{ title: 'Media Connections' }}
        filter={(e) => e.kind === 'media/screen' || e.kind === 'media/video'}
      />
    );
    bus.fire({ type: 'DEV/modal', payload: { el, target: 'body' } });
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Media Connections'} items={items} defaults={{ clipboard: false }} />
      <Hr thickness={5} opacity={0.1} margin={[10, 0]} />
      <div {...styles.footer}>
        <div />
        <Button label={'Expand'} onClick={handleExpandClick} />
      </div>
    </div>
  );
};

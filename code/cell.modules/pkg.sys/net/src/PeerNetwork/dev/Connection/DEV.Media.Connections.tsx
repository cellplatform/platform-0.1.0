import React, { useEffect, useRef, useState } from 'react';

import { Button, css, CssValue, Hr, PropList, PropListItem, t } from '../common';
import { DevNetworkConnectionsModal } from '../Network/';

/**
 * Card body.
 */
export type DevMediaConnectionsProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connections: t.PeerConnectionMediaStatus[];
  style?: CssValue;
};
export const DevMediaConnections: React.FC<DevMediaConnectionsProps> = (props) => {
  const { netbus, connections, self } = props;
  const bus = props.bus.type<t.DevEvent>();

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
      <Hr thickness={5} opacity={0.1} margin={[10, 0, 10, 0]} />
      <div {...styles.footer}>
        <div />
        <Button label={'Expand'} onClick={handleExpandClick} />
      </div>
    </div>
  );
};

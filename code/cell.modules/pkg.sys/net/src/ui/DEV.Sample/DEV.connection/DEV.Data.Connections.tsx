import React from 'react';

import { Button, css, CssValue, Hr, PropList, t } from '../DEV.common';
import { DevNetworkConnectionsModal } from '../DEV.network';
import { openHandler } from './util';

/**
 * Card body.
 */
export type DevDataConnectionsProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  connections: t.PeerConnectionDataStatus[];
  style?: CssValue;
};
export const DevDataConnections: React.FC<DevDataConnectionsProps> = (props) => {
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

  const items: t.PropListItem[] = connections.map((connection, i) => {
    const open = (kind: t.PeerConnectionKindMedia) => openHandler({ bus, connection, kind });
    const value = (
      <div {...styles.value.base}>
        <div {...styles.value.label}>start:</div>
        <Button label={'video'} onClick={open('media/video')} margin={[null, 8, null, null]} />
        <Button label={'screen'} onClick={open('media/screen')} />
      </div>
    );
    return { label: connection.id, value };
  });

  const handleExpandClick = () => {
    const el = (
      <DevNetworkConnectionsModal
        self={self}
        bus={bus}
        netbus={netbus}
        header={{ title: 'Data Connections' }}
        filter={(e) => e.kind === 'data'}
      />
    );
    bus.fire({ type: 'DEV/modal', payload: { el, target: 'body' } });
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Data Connections'} items={items} defaults={{ clipboard: false }} />
      <Hr thickness={5} opacity={0.1} margin={[10, 0]} />
      <div {...styles.footer}>
        <div />
        <Button label={'Expand'} onClick={handleExpandClick} />
      </div>
    </div>
  );
};

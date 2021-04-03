import React, { useEffect, useRef, useState } from 'react';

import { Button, Card, css, CssValue, Hr, Icons, PropList, PropListItem, t } from './common';
import { EventStack } from './DEV.EventStack';
import { ConnectionData } from './DEV.Connection.Data';

export type ConnectionProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionStatus;
  isLast?: boolean;
  style?: CssValue;
  margin?: t.CssEdgesInput;
};

export const Connection: React.FC<ConnectionProps> = (props) => {
  const { connection, netbus } = props;
  const id = connection.id;
  const bus = props.bus.type<t.PeerEvent>();

  const items: PropListItem[] = [
    { label: 'id', value: { data: id.remote, clipboard: true } },
    { label: 'kind', value: connection.kind },
    { label: 'open', value: connection.isOpen },
  ];
  if (connection.kind === 'data') {
    items.push(...[{ label: 'reliable', value: connection.isReliable }]);
  }

  const styles = {
    base: css({ position: 'relative', fontSize: 14 }),
    close: css({ Absolute: [5, 5, null, null] }),
  };

  const hr = <Hr thickness={5} opacity={0.1} margin={[10, 0]} />;

  const handleClose = () => {
    bus.fire({
      type: 'Peer:Connection/disconnect:req',
      payload: { self: id.self, remote: id.remote },
    });
  };

  const elCloseButton = (
    <Button style={styles.close} onClick={handleClose}>
      <Icons.Close size={18} />
    </Button>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Card
        key={id.remote}
        padding={[18, 20, 20, 20]}
        margin={props.margin}
        width={280}
        shadow={false}
      >
        <PropList title={'PeerConnection'} items={items} defaults={{ clipboard: false }} />

        {hr}

        {connection.kind === 'data' && <ConnectionData netbus={netbus} connection={connection} />}

        {elCloseButton}
      </Card>
    </div>
  );
};

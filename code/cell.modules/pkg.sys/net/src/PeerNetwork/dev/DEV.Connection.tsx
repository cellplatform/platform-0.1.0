import React from 'react';

import { Button, Card, css, CssValue, Hr, Icons, PropList, PropListItem, t } from './common';
import { ConnectionData } from './DEV.Connection.Data';
import { ConnectionMedia } from './DEV.Connection.Media';

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

        {connection.kind === 'data' && <ConnectionData netbus={netbus} connection={connection} />}
        {connection.kind === 'media' && <ConnectionMedia bus={bus} connection={connection} />}

        {elCloseButton}
      </Card>
    </div>
  );
};

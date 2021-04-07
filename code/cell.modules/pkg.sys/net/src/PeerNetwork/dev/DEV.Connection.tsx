import React from 'react';

import { Button, Card, css, CssValue, Hr, Icons, PropList, PropListItem, t } from './common';
import { ConnectionData } from './DEV.Connection.Data';
import { ConnectionMedia } from './DEV.Connection.Media';
import { Uri } from '../Uri';

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
  const peer = connection.peer;
  const uri = connection.uri;
  const bus = props.bus.type<t.PeerEvent>();

  const items: PropListItem[] = [
    { label: 'uri', value: { data: uri, clipboard: true } },
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
      payload: { self: peer.self, remote: peer.remote },
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
        key={peer.remote}
        padding={[18, 20, 20, 20]}
        margin={props.margin}
        width={320}
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

import React from 'react';

import { Button, Card, css, CssValue, Icons, t } from './common';
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
  const peer = connection.peer;
  const bus = props.bus.type<t.PeerEvent>();

  const styles = {
    base: css({ position: 'relative', fontSize: 14 }),
    close: css({ Absolute: [5, 5, null, null] }),
  };

  const handleClose = () => {
    bus.fire({
      type: 'Peer:Connection/disconnect:req',
      payload: { self: peer.self, connection: connection.id, remote: peer.remote },
    });
  };

  const elCloseButton = (
    <Button style={styles.close} onClick={handleClose}>
      <Icons.Close size={18} />
    </Button>
  );

  const elData = connection.kind === 'data' && (
    <ConnectionData bus={bus} netbus={netbus} connection={connection} />
  );

  const elMedia = connection.kind === 'media' && (
    <ConnectionMedia bus={bus} connection={connection} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Card
        key={peer.remote}
        padding={[18, 20, 20, 20]}
        margin={props.margin}
        width={300}
        shadow={false}
      >
        {elData}
        {elMedia}
        {elCloseButton}
      </Card>
    </div>
  );
};

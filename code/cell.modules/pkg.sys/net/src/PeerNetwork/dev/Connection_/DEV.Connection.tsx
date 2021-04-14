import React from 'react';

import { Button, Card, css, CssValue, Icons, t } from '../common';
import { DevConnectionData } from './DEV.Connection.Data';
import { DevConnectionMedia } from './DEV.Connection.Media';

export type DevConnectionProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionStatus;
  isLast?: boolean;
  style?: CssValue;
  margin?: t.CssEdgesInput;
};

export const DevConnection: React.FC<DevConnectionProps> = (props) => {
  const { connection, netbus } = props;
  const { peer } = connection;
  const bus = props.bus.type<t.PeerEvent>();

  const styles = {
    base: css({ position: 'relative', fontSize: 14 }),
    close: css({ Absolute: [5, 5, null, null] }),
  };

  const handleClose = () => {
    const { self, remote } = peer;
    bus.fire({
      type: 'sys.net/peer/connection/disconnect:req',
      payload: { self, remote, connection: connection.id },
    });
  };

  const elCloseButton = (
    <Button style={styles.close} onClick={handleClose}>
      <Icons.Close size={18} />
    </Button>
  );

  const elData = connection.kind === 'data' && (
    <DevConnectionData bus={bus} netbus={netbus} connection={connection} />
  );

  const elMedia = (connection.kind === 'media/video' || connection.kind === 'media/screen') && (
    <DevConnectionMedia bus={bus} connection={connection} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Card key={peer.remote} margin={props.margin} width={300} shadow={false}>
        {elData}
        {elMedia}
        {elCloseButton}
      </Card>
    </div>
  );
};

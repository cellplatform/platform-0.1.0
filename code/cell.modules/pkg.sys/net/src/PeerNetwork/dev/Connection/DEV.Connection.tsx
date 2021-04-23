import React from 'react';

import { css, CssValue, t, Dropped } from '../common';
import { DevCard } from '../DEV.Card';
import { DevDataConnection } from './DEV.Data.Connection';
import { DevMediaConnection } from './DEV.Media.Connection';

export type DevConnectionProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  connection: t.PeerConnectionStatus;
  margin?: t.CssEdgesInput;
  style?: CssValue;
};

export const DevConnection: React.FC<DevConnectionProps> = (props) => {
  const { connection, netbus } = props;
  const { peer } = connection;
  const bus = props.bus.type<t.PeerEvent>();

  const styles = {
    base: css({ position: 'relative' }),
    close: css({ Absolute: [5, 5, null, null] }),
  };

  const handleClose = () => {
    const { self, remote } = peer;
    bus.fire({
      type: 'sys.net/peer/connection/disconnect:req',
      payload: { self, remote, connection: connection.id },
    });
  };

  const elData = connection.kind === 'data' && (
    <DevDataConnection bus={bus} netbus={netbus} connection={connection} />
  );

  const elMedia = (connection.kind === 'media/video' || connection.kind === 'media/screen') && (
    <DevMediaConnection bus={bus} connection={connection} />
  );

  const handleDrop = (e: Dropped) => {
    console.log('file dropped', e);
  };

  return (
    <div {...css(styles.base, props.style)}>
      <DevCard
        margin={props.margin}
        onClose={handleClose}
        onDrop={connection.kind === 'data' ? handleDrop : undefined}
      >
        {elData}
        {elMedia}
      </DevCard>
    </div>
  );
};

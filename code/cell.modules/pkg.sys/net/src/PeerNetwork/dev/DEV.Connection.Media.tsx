import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, Hr, t } from './common';
import { DevVideo } from './DEV.Media.Video';

export type ConnectionMediaProps = {
  bus: t.EventBus<any>;
  connection: t.PeerConnectionMediaStatus;
  style?: CssValue;
};

export const ConnectionMedia: React.FC<ConnectionMediaProps> = (props) => {
  const { connection } = props;
  const bus = props.bus.type<t.PeerEvent>();
  const peerId = connection.peer.remote;

  const styles = {
    base: css({ position: 'relative' }),
    video: css({ Flex: 'vertical-center-center' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Hr thickness={5} opacity={0.1} margin={[10, 0, 20, 0]} />
      <div {...styles.video}>
        <DevVideo bus={bus} peerId={peerId} />
      </div>
    </div>
  );
};

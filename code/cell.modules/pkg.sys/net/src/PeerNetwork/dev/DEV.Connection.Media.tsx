import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, Hr, t, PropList, PropListItem } from './common';
import { DevVideo } from './DEV.Media.Video';

export type ConnectionMediaProps = {
  bus: t.EventBus<any>;
  connection: t.PeerConnectionMediaStatus;
  style?: CssValue;
};

export const ConnectionMedia: React.FC<ConnectionMediaProps> = (props) => {
  const { connection } = props;
  const bus = props.bus.type<t.PeerEvent>();
  const peer = connection.peer;

  const items: PropListItem[] = [
    { label: 'peer', value: { data: peer.remote, clipboard: true } },
    { label: 'id', value: { data: connection.id, clipboard: true } },
    { label: 'open', value: connection.isOpen },
  ];

  const styles = {
    base: css({ position: 'relative' }),
    video: css({ Flex: 'vertical-center-center' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Media Connection'} items={items} defaults={{ clipboard: false }} />

      <Hr thickness={5} opacity={0.1} margin={[10, 0, 20, 0]} />

      <div {...styles.video}>
        <DevVideo bus={bus} peerId={peer.remote} />
      </div>
    </div>
  );
};

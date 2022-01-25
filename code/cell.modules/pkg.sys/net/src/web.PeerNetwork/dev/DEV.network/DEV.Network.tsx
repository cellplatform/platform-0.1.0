import React, { useRef } from 'react';
import { Hr } from 'sys.ui.primitives/lib/ui/Hr';

import { css, CssValue, t } from '../DEV.common';
import { useGroupController, useLocalController, useGroupScreensize } from '../DEV.hooks';
import { DevNetworkConnections } from './DEV.Network.Connections';
import { DevNetworkHeader } from './DEV.Network.Header';
import { DevNetworkRemote } from './DEV.Network.Remote';

export type DevNetworkProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  self: {
    id: t.PeerId;
    status: t.PeerStatus;
    media: { video?: MediaStream; screen?: MediaStream };
  };
  others?: { headerVideos?: boolean };
  collapse?: boolean | { data?: boolean; media?: boolean };
  cards?: { data?: boolean; media?: boolean };
  style?: CssValue;
};

export const DevNetwork: React.FC<DevNetworkProps> = (props) => {
  const { self, netbus, others = {} } = props;
  const bus = props.bus as t.EventBus<t.PeerEvent>;

  const baseRef = useRef<HTMLDivElement>(null);

  const local = useLocalController({ bus });
  useGroupController({ bus, netbus });
  useGroupScreensize({ kind: 'root', ref: baseRef, netbus, bus });

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      boxSizing: 'border-box',
      position: 'relative',
      fontSize: 14,
    }),
    body: css({ flex: 1, position: 'relative' }),
    modal: css({ Absolute: 0, display: 'flex' }),
  };

  const modalSize = local.modal?.target;
  const elModal = local.modal?.el && <div {...styles.modal}>{local.modal.el}</div>;

  const elBody = (
    <div {...styles.body}>
      <DevNetworkConnections
        bus={bus}
        netbus={netbus}
        collapse={props.collapse}
        cards={props.cards}
        showNetbus={true}
      />
      {modalSize === 'body' && elModal}
      {!elModal && <DevNetworkRemote bus={bus} />}
    </div>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <DevNetworkHeader bus={bus} self={self} others={{ showVideo: others.headerVideos }} />
      <Hr thickness={10} opacity={0.05} margin={0} />
      {elBody}
      {modalSize === 'fullscreen' && elModal}
    </div>
  );
};

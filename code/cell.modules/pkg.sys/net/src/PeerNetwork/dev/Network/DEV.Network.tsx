import React from 'react';
import { Hr } from 'sys.ui.primitives/lib/components/Hr';

import { css, CssValue, t } from '../common';
import { useDevState } from '../DEV.useDevState';
import { DevNetworkHeader } from './DEV.Network.Header';
import { DevNetworkCards } from './DEV.Network.Cards';

export type DevNetworkProps = {
  bus: t.EventBus<any>;
  netbus: t.EventBus<any>;
  peer: t.PeerStatus;
  media: { video?: MediaStream; screen?: MediaStream };
  style?: CssValue;
};

export const DevNetwork: React.FC<DevNetworkProps> = (props) => {
  const { peer, media, netbus } = props;
  const bus = props.bus.type<t.PeerEvent>();
  const state = useDevState({ bus });
  const connections = peer.connections;

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
    empty: css({
      Absolute: 0,
      Flex: 'center-center',
      fontStyle: 'italic',
      opacity: 0.3,
      userSelect: 'none',
    }),
  };

  const elEmpty = connections.length === 0 && (
    <div {...styles.empty}>No connections to display.</div>
  );

  const modalSize = state.modal?.size;
  const elModal = state.modal?.el && <div {...styles.modal}>{state.modal.el}</div>;

  const elBody = (
    <div {...styles.body}>
      <DevNetworkCards bus={bus} netbus={netbus} peer={peer} />
      {elEmpty}
      {modalSize === 'body' && elModal}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <DevNetworkHeader bus={bus} peer={peer} media={media} />
      <Hr thickness={10} opacity={0.05} margin={0} />
      {elBody}
      {modalSize === 'fullscreen' && elModal}
    </div>
  );
};

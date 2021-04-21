import React from 'react';
import { Hr } from 'sys.ui.primitives/lib/components/Hr';

import { css, CssValue, t } from '../common';
import { DevConnection } from '../Connection';
import { useDevState } from '../DEV.useDevState';
import { DevNetworkHeader } from './DEV.Network.Header';

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

  const PADDING = { CARD: 25 };

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      boxSizing: 'border-box',
      position: 'relative',
    }),
    body: {
      base: css({ flex: 1, position: 'relative' }),
      scroll: css({
        Absolute: 0,
        Scroll: true,
        display: 'flex',
        flexWrap: 'wrap',
        paddingBottom: 80,
        paddingRight: PADDING.CARD,
      }),
    },
    modal: css({ Absolute: 0, display: 'flex' }),
    empty: css({
      Absolute: 0,
      Flex: 'center-center',
      fontSize: 14,
      fontStyle: 'italic',
      opacity: 0.3,
    }),
  };

  const connections = peer.connections;

  const elEmpty = connections.length === 0 && (
    <div {...styles.empty}>No connections to display.</div>
  );

  const elConnections = connections.map((item, i) => {
    const isLast = i === connections.length - 1;
    return (
      <DevConnection
        key={item.uri}
        bus={bus}
        netbus={netbus}
        connection={item}
        isLast={isLast}
        margin={[PADDING.CARD, 0, 0, PADDING.CARD]}
      />
    );
  });

  const modalSize = state.modal?.size;
  const elModal = state.modal?.el && <div {...styles.modal}>{state.modal.el}</div>;

  return (
    <div {...css(styles.base, props.style)}>
      <DevNetworkHeader bus={bus} peer={peer} media={media} />
      <Hr thickness={10} opacity={0.05} margin={0} />
      <div {...styles.body.base}>
        <div {...styles.body.scroll}>{elConnections}</div>
        {elEmpty}
        {modalSize === 'body' && elModal}
      </div>
      {modalSize === 'fullscreen' && elModal}
    </div>
  );
};

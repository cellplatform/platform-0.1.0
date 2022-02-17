import React from 'react';

import { Label } from '../../Label';
import { css, CssValue, t, useLocalPeer } from '../common';
import { BodyColumnHr, BodyColumnTitle } from './Body.Column';

export type BodyColumnLeftProps = {
  network: t.PeerNetwork;
  self: t.PeerId;
  style?: CssValue;
};

export const BodyColumnLeft: React.FC<BodyColumnLeftProps> = (props) => {
  const { network } = props;
  const bus = network.bus;
  const self = useLocalPeer({ bus, self: props.self });

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: 'y-stretch-stretch', position: 'relative' }),
    peer: css({ marginLeft: 10, marginBottom: 5 }),
  };

  const elPeer = (
    <Label.Peer id={self.id} isSelf={true} media={self.media.video} style={styles.peer} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <BodyColumnTitle>{'LOCAL'}</BodyColumnTitle>
      {elPeer}
      <BodyColumnHr />
    </div>
  );
};

import React from 'react';
import { ObjectView } from 'sys.ui.dev';

import { usePeerNetwork } from '..';
import { css, CssValue, t } from '../common';
import { useLocalPeer } from '../../../web.ui.hooks';
import { LocalPeerProps } from '../../../web.ui/LocalPeerProps';

export type DevSampleProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { self, bus } = props;

  const net = usePeerNetwork({ bus }); // TEMP 🐷

  const peer = useLocalPeer({ self, bus });
  const status = peer.status;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      padding: 15, // TEMP 🐷
    }),
    peerProps: css({
      marginBottom: 30,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.peerProps}>
        {status && <LocalPeerProps bus={bus} self={{ id: self, status }} newConnections={true} />}
      </div>
      <div>
        <ObjectView name={'peer'} data={peer} />
      </div>
    </div>
  );
};

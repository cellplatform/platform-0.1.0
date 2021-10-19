import React from 'react';

import { css, CssValue, t } from '../common';
import { DevVideo } from '../media';
import { LocalPeerProps } from '../../components/LocalPeerProps';

export type DevNetworkHeaderProps = {
  bus: t.EventBus<any>;
  self: {
    id: t.PeerId;
    status: t.PeerStatus;
    media: { video?: MediaStream; screen?: MediaStream };
  };
  style?: CssValue;
};

export const DevNetworkHeader: React.FC<DevNetworkHeaderProps> = (props) => {
  const { self } = props;
  const bus = props.bus as t.EventBus<t.PeerEvent>;

  const styles = {
    base: css({ Flex: 'horizontal-spaceBetween-start', padding: 15 }),
    left: css({ Flex: 'vertical-stretch-stretch' }),
    right: css({ Flex: 'horizontal-stretch-stretch' }),
  };

  const elSelfVideo = self.media.video && (
    <DevVideo
      bus={bus}
      kind={'media/video'}
      stream={self.media.video}
      isSelf={true}
      isRecordable={true}
    />
  );

  const elSelfScreen = self.media.screen && (
    <DevVideo
      bus={bus}
      kind={'media/screen'}
      stream={self.media.screen}
      style={{ marginRight: 15 }}
    />
  );

  const m = self.status.connections.map((conn) => {
    console.log(' > ', conn);
  });

  // console.log('peer.connections', peer.connections);

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        <LocalPeerProps
          self={{ id: self.id, status: self.status }}
          bus={bus}
          newConnections={true}
        />
      </div>
      <div {...styles.right}>
        {elSelfScreen}
        {elSelfVideo}
      </div>
    </div>
  );
};

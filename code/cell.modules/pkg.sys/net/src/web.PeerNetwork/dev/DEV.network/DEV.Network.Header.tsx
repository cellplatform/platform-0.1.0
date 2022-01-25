import React from 'react';

import { css, CssValue, t } from '../DEV.common';
import { DevVideo } from '../DEV.media';
import { LocalPeerProps } from '../../components/LocalPeerProps';

export type DevNetworkHeaderProps = {
  bus: t.EventBus<any>;
  self: {
    id: t.PeerId;
    status: t.PeerStatus;
    media: { video?: MediaStream; screen?: MediaStream };
  };
  others?: { showVideo?: boolean };
  style?: CssValue;
};

export const DevNetworkHeader: React.FC<DevNetworkHeaderProps> = (props) => {
  const { self, others = {} } = props;
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

  const elOthersVideo =
    others.showVideo &&
    self.status.connections
      .filter((conn) => conn.kind === 'media/video')
      .map((conn) => conn as t.PeerConnectionMediaStatus)
      .map((conn, i) => {
        return (
          <DevVideo
            key={i}
            bus={bus}
            kind={'media/video'}
            stream={conn.media}
            style={{ marginRight: 6 }}
          />
        );
      });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        <LocalPeerProps
          self={{ id: self.id, status: self.status }}
          bus={bus}
          newConnections={{ isReliable: true, autoStartVideo: true }}
        />
      </div>
      <div {...styles.right}>
        {elOthersVideo}
        {elSelfScreen}
        {elSelfVideo}
      </div>
    </div>
  );
};

import React from 'react';

import { css, CssValue, t } from '../common';
import { DevVideo } from '../media';
import { LocalPeerProps } from '../../components/LocalPeerProps';

export type DevNetworkHeaderProps = {
  peer: t.PeerStatus;
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
  media: { video?: MediaStream; screen?: MediaStream };
  style?: CssValue;
};

export const DevNetworkHeader: React.FC<DevNetworkHeaderProps> = (props) => {
  const { peer, media, netbus } = props;
  const bus = props.bus as t.EventBus<t.PeerEvent>;
  const self = netbus.self;

  const styles = {
    base: css({ Flex: 'horizontal-spaceBetween-start', padding: 15 }),
    left: css({ Flex: 'vertical-stretch-stretch' }),
    right: css({ Flex: 'horizontal-stretch-stretch' }),
  };

  const elSelfScreen = media.screen && (
    <DevVideo kind={'media/screen'} stream={media.screen} style={{ marginRight: 15 }} bus={bus} />
  );

  const elSelfVideo = media.video && (
    <DevVideo
      kind={'media/video'}
      stream={media.video}
      bus={bus}
      isSelf={true}
      isRecordable={true}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        <LocalPeerProps self={self} status={peer} bus={bus} allowNewConnections={true} />
      </div>
      <div {...styles.right}>
        {elSelfScreen}
        {elSelfVideo}
      </div>
    </div>
  );
};

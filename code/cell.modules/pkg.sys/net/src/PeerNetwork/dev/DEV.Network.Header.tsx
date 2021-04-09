import React from 'react';

import { css, CssValue, t } from './common';
import { SelfPropList } from './DEV.Self.PropList';
import { DevVideo } from './DEV.Video';

export type DevNetworkHeaderProps = {
  bus: t.EventBus<any>;
  peer: t.PeerStatus;
  media: { video?: MediaStream; screen?: MediaStream };
  style?: CssValue;
};

export const DevNetworkHeader: React.FC<DevNetworkHeaderProps> = (props) => {
  const { peer, media } = props;
  const bus = props.bus.type<t.PeerEvent>();

  const styles = {
    base: css({
      Flex: 'horizontal-spaceBetween-start',
      padding: 15,
    }),
    right: css({
      Flex: 'horizontal-stretch-stretch',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <SelfPropList status={peer} />
      <div {...styles.right}>
        {media.screen && (
          <DevVideo kind={'media/screen'} stream={media.screen} style={{ marginRight: 15 }} />
        )}
        {media.video && <DevVideo kind={'media/video'} stream={media.video} />}
      </div>
    </div>
  );
};

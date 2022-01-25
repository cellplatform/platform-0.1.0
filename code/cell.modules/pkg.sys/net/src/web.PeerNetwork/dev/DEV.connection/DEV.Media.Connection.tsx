import React from 'react';

import { css, CssValue, Hr, PropList, PropListItem, t, isLocalhost } from '../DEV.common';
import { DevVideo } from '../DEV.media';
import { PropUtil } from './util';

export type DevMediaConnectionProps = {
  self: t.PeerId;
  bus: t.EventBus<any>;
  connection: t.PeerConnectionMediaStatus;
  style?: CssValue;
};

export const DevMediaConnection: React.FC<DevMediaConnectionProps> = (props) => {
  const { connection, bus } = props;
  const { kind } = connection;
  const streamId = connection.media?.id;

  const items: PropListItem[] = [...PropUtil.common(connection)];

  const styles = {
    base: css({ position: 'relative', padding: 12, paddingRight: 18 }),
    video: css({ Flex: 'vertical-center-center' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Media Connection'} items={items} defaults={{ clipboard: false }} />

      {streamId && (
        <>
          <Hr thickness={5} opacity={0.1} margin={[10, 0, 20, 0]} />

          <div {...styles.video}>
            <DevVideo
              kind={kind}
              stream={connection.media}
              isVideoMuted={isLocalhost ? true : false}
              bus={bus}
            />
          </div>
        </>
      )}
    </div>
  );
};

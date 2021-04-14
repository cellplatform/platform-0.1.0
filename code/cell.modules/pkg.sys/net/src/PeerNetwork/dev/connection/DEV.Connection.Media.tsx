import React from 'react';
import { css, CssValue, Hr, t, PropList, PropListItem } from '../common';
import { DevVideo } from '../DEV.Video';
import { ItemUtil } from './util';

export type DevConnectionMediaProps = {
  bus: t.EventBus<any>;
  connection: t.PeerConnectionMediaStatus;
  style?: CssValue;
};

export const DevConnectionMedia: React.FC<DevConnectionMediaProps> = (props) => {
  const { connection, bus } = props;
  const { kind } = connection;

  const streamId = connection.media?.id;
  const isLocalhost = location.hostname === 'localhost';

  const items: PropListItem[] = [...ItemUtil.common(connection)];

  const styles = {
    base: css({
      position: 'relative',
      padding: 20,
      paddingTop: 18,
    }),
    video: css({
      Flex: 'vertical-center-center',
    }),
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

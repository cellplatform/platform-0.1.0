import React from 'react';
import { css, CssValue, Hr, t, PropList, PropListItem, StringUtil } from './common';
import { DevVideo } from './DEV.Video';

export type ConnectionMediaProps = {
  bus: t.EventBus<any>;
  connection: t.PeerConnectionMediaStatus;
  style?: CssValue;
};

export const ConnectionMedia: React.FC<ConnectionMediaProps> = (props) => {
  const { connection, bus } = props;
  const { peer, kind } = connection;

  const streamId = connection.media?.id;
  const isLocalhost = location.hostname === 'localhost';

  const items: PropListItem[] = [
    { label: 'id', value: { data: connection.id, clipboard: true } },
    { label: 'remote peer', value: { data: peer.remote, clipboard: true } },
    { label: 'kind', value: kind },
    { label: 'open', value: connection.isOpen },
  ];

  const styles = {
    base: css({ position: 'relative' }),
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

import React from 'react';
import { css, CssValue, Hr, t, PropList, PropListItem, StringUtil } from './common';
import { DevVideo } from './DEV.Video';

export type ConnectionMediaProps = {
  bus: t.EventBus<any>;
  connection: t.PeerConnectionMediaStatus;
  style?: CssValue;
};

export const ConnectionMedia: React.FC<ConnectionMediaProps> = (props) => {
  const { connection } = props;
  const peer = connection.peer;

  const streamId = connection.media.id;

  const items: PropListItem[] = [
    { label: 'id', value: { data: connection.id, clipboard: true } },
    { label: 'peer (remote)', value: { data: peer.remote, clipboard: true } },
    { label: 'stream.id', value: { data: StringUtil.truncate(streamId), clipboard: streamId } },
    { label: 'open', value: connection.isOpen },
  ];

  const styles = {
    base: css({ position: 'relative' }),
    video: css({ Flex: 'vertical-center-center' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={'Media Connection'} items={items} defaults={{ clipboard: false }} />

      <Hr thickness={5} opacity={0.1} margin={[10, 0, 20, 0]} />

      <div {...styles.video}>
        <DevVideo stream={connection.media} />
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';

import { Spinner } from '../Primitives';
import { createPeer, css, CssValue, PeerJS, t } from './common';
import { Layout } from './Layout';
import { usePeerController } from './usePeerController';

export type ConversationProps = {
  bus: t.EventBus;
  imageDir?: string | string[];
  style?: CssValue;
};

export const Conversation: React.FC<ConversationProps> = (props) => {
  const { bus, imageDir } = props;
  const [self, setSelf] = useState<PeerJS>();

  usePeerController({ bus });

  useEffect(() => {
    const peer = createPeer({ bus });
    peer.on('open', () => setSelf(peer));
    return () => peer?.destroy();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      position: 'relative',
      display: 'flex',
      flex: 1,
    }),
    spinner: css({ Absolute: 0, Flex: 'center-center' }),
  };

  const elSpinner = !self && (
    <div {...styles.spinner}>
      <Spinner />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elSpinner}
      {self && <Layout bus={bus} peer={self} imageDir={imageDir} />}
    </div>
  );
};

import React, { useEffect, useState } from 'react';

import { Spinner } from '../Primitives';
import { createPeer, css, CssValue, PeerJS, t } from './common';
import { Layout } from './Layout';
import { usePeerController } from './usePeerController';

export type ConversationProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const Conversation: React.FC<ConversationProps> = (props) => {
  const { bus } = props;
  const [self, setSelf] = useState<PeerJS>();
  const { state } = usePeerController({ bus });

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
      {self && <Layout bus={bus} peer={self} model={state} />}
    </div>
  );
};

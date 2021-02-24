import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

import { Spinner } from '../Primitives';
import { createPeer, css, CssValue, PeerJS, t } from './common';
import { Layout } from './Layout';

export type ConversationProps = {
  bus: t.EventBus<any>;
  model: t.ConversationModel;
  style?: CssValue;
};

export const Conversation: React.FC<ConversationProps> = (props) => {
  const { bus, model } = props;
  const [self, setSelf] = useState<PeerJS>();
  const [state, setState] = useState<t.ConversationState>(model.state);

  useEffect(() => {
    const peer = createPeer({ bus });
    peer.on('open', () => setSelf(peer));

    const dispose$ = new Subject<void>();
    model.event.changed$.subscribe((e) => setState(e.to));

    return () => {
      peer?.destroy();
      dispose$.next();
    };
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

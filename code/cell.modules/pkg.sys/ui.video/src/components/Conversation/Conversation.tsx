import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

import { Spinner } from '../Primitives';
import { createPeer, css, CssValue, PeerJS, t } from './common';
import { Layout } from './Layout';

export type ConversationProps = {
  bus: t.EventBus<any>;
  model: t.ConversationModel;
  body?: JSX.Element;
  style?: CssValue;
};

export const Conversation: React.FC<ConversationProps> = (props) => {
  const { model } = props;
  const bus = props.bus.type<t.ConversationEvent>();
  const [self, setSelf] = useState<PeerJS>();
  const [state, setState] = useState<t.ConversationState>(model.state);

  useEffect(() => {
    const peer = createPeer({ bus });
    peer.on('open', () => {
      setSelf(peer);
      bus.fire({ type: 'Conversation/model/publish', payload: { data: {} } }); // NB: Causes [peer] data to be broadcast.
    });

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
      {self && <Layout bus={bus} peer={self} model={state} body={props.body} />}
    </div>
  );
};

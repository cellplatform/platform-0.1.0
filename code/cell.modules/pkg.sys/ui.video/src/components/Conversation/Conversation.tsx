import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Spinner } from '../Primitives';
import { createPeer, css, CssValue, PeerJS, rx, t } from './common';
import { Layout } from './Layout';
import { PeerImage } from './PeerImage';
import { Remote } from './Remote';

export type ConversationProps = {
  bus: t.EventBus<any>;
  model: t.ConversationModel;
  blur?: number;
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
      bus.fire({ type: 'Conversation/publish', payload: { kind: 'model', data: {} } }); // NB: Causes [peer] data to be broadcast.
    });

    const dispose$ = new Subject<void>();
    model.event.changed$.pipe(takeUntil(dispose$)).subscribe((e) => setState(e.to));

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
      filter: props.blur ? `blur(8px)` : undefined,
      transition: `filter 400ms`,
    }),
    spinner: css({ Absolute: 0, Flex: 'center-center' }),
  };

  const elSpinner = !self && (
    <div {...styles.spinner}>
      <Spinner />
    </div>
  );

  const remote = state.remote;
  const elRemote = remote && (
    <Remote
      url={remote.url}
      namespace={remote.namespace}
      entry={remote.entry}
      props={remote.props}
    />
  );

  const elLocal = !remote && <PeerImage bus={bus} style={{ Absolute: 50 }} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elSpinner}
      {self && (
        <Layout bus={bus} peer={self} model={state}>
          {elLocal}
          {elRemote}
        </Layout>
      )}
    </div>
  );
};

import * as React from 'react';

import { Command, id as idUtil, t } from '../common';
import { Test } from '../components/Test.Conversation';

type P = t.ICommandProps;

/**
 * The root of the CLI application.
 */
export const conversation = Command.create<P>('Conversation', e => {
  const el = <Test store={e.props.threadStore} />;
  e.props.next({ el });
})
  .add('add', e => {
    const store = e.props.threadStore;
    const id = idUtil.cuid();
    const timestamp = new Date();
    const user = { id: '1234', name: 'mary@foo.com' };
    store.dispatch({
      type: 'THREAD/add',
      payload: { item: { kind: 'THREAD/comment', id, timestamp, user } },
    });
  })
  .add('pop', e => {
    const store = e.props.threadStore;
    const items = [...store.state.items];
    items.pop();
    store.dispatch({ type: 'THREAD/items', payload: { items } });
  });

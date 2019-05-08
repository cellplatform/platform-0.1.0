import * as React from 'react';

import { Command, PEOPLE, t, time } from '../common';
import { Test } from '../components/Test.Conversation';

type P = t.ICommandProps;

/**
 * The root of the CLI application.
 */
export const conversation = Command.create<P>('Conversation', e => {
  const el = <Test store={e.props.threadStore} />;
  e.props.next({ el });
})
  .add('load', async e => {
    const graphql = e.props.graphql;
    const thread = await graphql.thread.findById('th/1234');
    if (thread) {
      const store = e.props.threadStore;
      store.dispatch({ type: 'THREAD/load', payload: { thread } });
    }
  })
  .add('add', e => {
    const store = e.props.threadStore;
    const timestamp = time.toTimestamp();
    const user = PEOPLE.DOUG;
    const markdown = e.param(0, 'Hey there 👋');
    store.dispatch({
      type: 'THREAD/add',
      payload: {
        user,
        item: {
          kind: 'THREAD/comment',
          id: '', // NB: Proper id is generated within resolver.
          timestamp,
          user: user.id,
          body: { markdown },
        },
      },
    });
  })
  .add('pop', e => {
    const store = e.props.threadStore;
    const items = [...store.state.items];
    items.pop();
    store.dispatch({ type: 'THREAD/items', payload: { items } });
  });

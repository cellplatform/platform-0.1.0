import * as React from 'react';
import { Command, t } from '../common';
import { Test } from '../components/Test.Conversation';

type P = t.ICommandProps;

/**
 * The root of the CLI application.
 */
export const conversation = Command.create<P>('Conversation', e => {
  const el = <Test store={e.props.threadStore} />;
  e.props.next({ el });
})
  //
  .add('add', e => {
    const store = e.props.threadStore;
    store.dispatch({ type: 'TEST/increment', payload: { by: 1 } });
  });

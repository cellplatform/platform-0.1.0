import * as React from 'react';
import { Command, t } from '../common';
import { Test } from '../components/Test.Conversation';

type P = t.ICommandProps & { count: number };

/**
 * The root of the CLI application.
 */
export const threadComment = Command.create<P>('ThreadComment', e => {
  const el = <Test />;
  e.props.next({ el });
})
  //
  .add('title', e => {});

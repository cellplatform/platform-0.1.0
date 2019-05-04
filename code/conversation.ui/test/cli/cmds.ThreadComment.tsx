import * as React from 'react';
import { Command, t } from '../common';
import { Test } from '../components/Test.ThreadComment';

type P = t.ICommandProps & { count: number };

/**
 * The root of the CLI application.
 */
export const threadComment = Command.create<P>('ThreadComment', e => {
  const el = <Test />;
  e.props.next({ el });
  console.log('root');
})
  .add('body', e => {
    // const key
    console.log('body');
  })
  .add('editor', e => {});

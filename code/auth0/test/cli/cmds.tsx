import * as React from 'react';
import { t, Command, css } from '../common';

type P = t.ITestCommandProps & { count: number };

const ns = Command.create<P>('ns')
  .add('one', async e => null)
  .add('two', async e => null)
  .add('three', async e => null);

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root', e => {
  console.log('root');
  const el = (
    <div>
      <div>hello</div>
    </div>
  );

  e.props.state$.next({ el });
})
  //
  .add('foo', async e => {})
  .add('bar')
  .add(ns);

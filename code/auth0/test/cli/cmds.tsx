import * as React from 'react';
import { t, Command, css } from '../components/common';

type P = t.ITestCommandProps & { count: number };

const ns = Command.create<P>('ns')
  .add('one', async e => null)
  .add('two', async e => null)
  .add('three', async e => null);

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  //
  .add('foo', async e => {
    const count = e.get('count', 0) + 1;
    e.set('count', count);

    const styles = { base: css({ PaddingX: 20 }) };
    const el = (
      <div {...styles.base}>
        <h1>My Foo {count} 👋</h1>
      </div>
    );

    e.props.state$.next({ el });
  })
  .add('bar')
  .add(ns);

import * as React from 'react';
import { t, Command, css } from '../common';
import { AuthState } from '../components/AuthState';
// import { part } from '../';

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
  .add('login', async e => {
    console.log('login');
    e.props.state$.next({ data: { foo: 123 } });
  })
  .add('logout', async e => {
    console.log('logout');
    e.props.state$.next({ data: { foo: 888 } });
  });
// .add('bar')
// .add(ns);

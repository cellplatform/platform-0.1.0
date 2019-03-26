import { Command, t } from '../common';

type P = t.ITestCommandProps;

const list = Command.create<P>('list', async e => true);

const ns = Command.create<P>('ns')
  .add('one', async e => null)
  .add('two', async e => null)
  .add('three', async e => null);

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add('grid', e => e.props.state$.next({ view: 'grid' }))
  .add('editor', e => e.props.state$.next({ view: 'editor' }))
  .add(ns);

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
  .add(list)
  .add(ns)
  .add('run', async e => null)
  .add('play', async e => null);

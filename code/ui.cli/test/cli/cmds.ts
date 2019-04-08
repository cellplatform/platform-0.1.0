import { Command, t } from '../common';

type P = t.ITestCommandProps;

const list = Command.create<P>({
  name: 'list',
  handler: e => true,
  description: 'List all items that match the input',
});

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
  .add({ name: 'run', handler: e => null, description: 'Run the thing now.' })
  .add({ name: 'play', handler: e => null, description: 'Play through the speakers loudly.' });

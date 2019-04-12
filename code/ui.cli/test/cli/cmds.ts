import { Command, t } from '../common';

type P = t.ITestCommandProps;

const list = Command.create<P>({
  name: 'list',
  handler: e => true,
  description: 'List all items that match the input',
});

const grandchild = Command.create<P>('grandchild')
  .add('expert', async e => null)
  .add('achiever', async e => null)
  .add('pluralist', async e => null)
  .add('strategist', async e => null);

const child = Command.create<P>('child')
  .add('foo', async e => null)
  .add('bar', async e => null)
  .add('baz', async e => null)
  .add(grandchild);

const ns = Command.create<P>('ns', e => {
  console.group('🌼 invoked:ns');
  console.log('e.command', e.command && e.command.name);
  console.log('e.namespace', e.namespace && e.namespace.name);
  console.groupEnd();
})
  .add('one', async e => console.log('invoked:one'))
  .add('two', async e => null)
  .add('three', async e => null)
  .add(child);

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root', e => {
  console.group('🌼 invoked:root');
  console.log('e.command', e.command && e.command.name);
  console.log('e.namespace', e.namespace && e.namespace.name);
  console.groupEnd();
})
  .add(list)
  .add(ns)
  .add({ name: 'run', handler: e => null, description: 'Run the thing now.' })
  .add({ name: 'play', handler: e => null, description: 'Play through the speakers loudly.' });

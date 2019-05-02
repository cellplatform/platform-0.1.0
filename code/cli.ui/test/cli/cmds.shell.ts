import { Command, t } from '../common';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const shell = Command.create<P>('shell', e => {
  console.group('🌼 invoked:shell');
})
  .add('tree-width', e => {
    console.log('e.args', e.args);
  })
  .add('tree-background');

import { Command, t } from '../common';

type P = t.ITestCommandProps;

const grid = Command.create<P>('grid', e => e.props.state$.next({ view: 'grid' }))
  .add('one', async e => null)
  .add('two', async e => null);

const editor = Command.create<P>('editor', e => e.props.state$.next({ view: 'editor' }))
  .add('one', async e => null)
  .add('two', async e => null);

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add(grid)
  .add(editor);

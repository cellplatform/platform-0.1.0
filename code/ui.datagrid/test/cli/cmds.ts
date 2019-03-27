import { Command, t } from '../common';

type P = t.ITestCommandProps;

const grid = Command
  // <DataGrid>
  .create<P>('grid', e => e.props.state$.next({ view: 'grid' }))
  .add('editor', e => e.props.state$.next({ editor: e.args.params[0] as t.TestEditorType }));

const editor = Command
  // <CellEditor>
  .create<P>('editor', e => e.props.state$.next({ view: 'editor' }));

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add(grid)
  .add(editor);

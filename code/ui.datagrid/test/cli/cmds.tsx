import * as React from 'react';

import { markdown, Command, t } from '../common';
import { grid as g } from './cmd.grid';

type P = t.ITestCommandProps;

const grid = Command
  // <DataGrid>
  .create<P>('grid', e => e.props.state$.next({ view: 'grid' }))
  .add('editor', e => e.props.state$.next({ editor: e.args.params[0] as t.TestEditorType }))
  .add('markdown', async e => {
    const text = `# Heading`;
    const html = await markdown.parse.toHtml(text);
    console.log('html', html);
  });

const editor = Command
  // <CellEditor>
  .create<P>('editor', e => e.props.state$.next({ view: 'editor' }));

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  // .add(grid)
  .add(grid)
  .add(editor)
  .add(g);
// .add(foo);

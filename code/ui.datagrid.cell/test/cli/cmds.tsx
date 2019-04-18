import { Command, t } from '../common';

type P = t.ICommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add('focus', e => {
    const editor = e.props.editorViews[0];
    editor.focus();
  })
  .add('selectAll', e => {
    const editor = e.props.editorViews[0];
    editor.selectAll().focus();
  })
  .add('cursorToStart', e => {
    const editor = e.props.editorViews[0];
    editor.cursorToStart().focus();
  })
  .add('cursorToEnd', e => {
    const editor = e.props.editorViews[0];
    editor.cursorToEnd().focus();
  });

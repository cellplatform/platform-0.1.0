import { shell } from 'electron';
import { Command } from '../common';
import * as t from './types';

type P = t.ICommandProps;

/**
 * [editor] sample input editor.
 */
export const editor = Command.create<P>('editor').add('cell', e => {
  let cellKey = e.args.params[0];
  if (cellKey && typeof cellKey === 'string' && cellKey.trim()) {
    cellKey = cellKey.trim();
    e.props.events$.next({ type: 'CLI/editor/cell', payload: { cellKey } });
  }
});

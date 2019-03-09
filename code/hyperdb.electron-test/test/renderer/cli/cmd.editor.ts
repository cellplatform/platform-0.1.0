import { shell } from 'electron';
import { Command } from '../common';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [editor] sample input editor.
 */
export const editor = Command.create<P>('editor').add('cell', e => {
  console.log('cell', e);
});

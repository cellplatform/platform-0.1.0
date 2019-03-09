import { Command } from '../common';
import { db } from './cmd.db';
import { editor } from './cmd.editor';
import { put } from './cmd.put';
import { tmp } from './cmd.tmp';
import { unwatch, watch } from './cmd.watch';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('hyperdb')
  .add(db)
  .add(watch)
  .add(unwatch)
  .add(put)
  .add(tmp)
  .add(editor);

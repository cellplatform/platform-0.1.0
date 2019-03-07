import { Command } from '../common';
import * as t from './types';
import { db } from './cmd.db';
import { watch } from './cmd.watch';
import { put } from './cmd.put';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('hyperdb')
  .add(db)
  .add(watch)
  .add(put);

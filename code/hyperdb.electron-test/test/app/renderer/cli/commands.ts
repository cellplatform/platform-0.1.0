import { Command } from '../common';
import * as t from './types';
import { db } from './cmd.db';
import { watch, unwatch } from './cmd.watch';
import { put } from './cmd.put';
import { tmp } from './cmd.tmp';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('hyperdb')
  .add(db)
  .add(watch)
  .add(unwatch)
  .add(put)
  .add(tmp);

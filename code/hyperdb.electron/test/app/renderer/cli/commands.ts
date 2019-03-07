import { Command } from '../common';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [db] status and global config.
 */
const db = Command.create<P>('db')
  .add('status', e => null)
  .add('new', e => null)
  .add('join', e => null);

/**
 * [watch] values in the DB.
 */
const watch = Command.create<P>('watch');

/**
 * [put] write to the DB.
 */
const put = Command.create<P>('put');

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('hyperdb')
  .add(db)
  .add(watch)
  .add(put);

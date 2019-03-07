import { Command } from '../common';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [db] status and global config.
 */
const db = Command.create<P>('db')
  .add('new', e => e.props.events$.next({ type: 'CLI/db/new', payload: {} }))
  .add('join', e => e.props.events$.next({ type: 'CLI/db/join', payload: {} }))
  .add('rename', async e => {
    const { db } = e.props;
    const name = (e.args.params[0] || '').toString().trim();
    if (db && name) {
      db.put('.sys/dbname', name);
    }
  });

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

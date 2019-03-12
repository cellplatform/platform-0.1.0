import { Command } from '../common';
import * as t from './types';
import { ITestDbData } from '../../types';

type P = t.ITestCommandProps;

/**
 * Create a new [primary] DB.
 */
export const create = Command.create<P>('new', async e => {
  const { databases, store, log, events$ } = e.props;
  const dbKey = undefined;
  const prefix = 'primary-';

  const name = e.args.params[0];
  const values = await store.read('dir', 'databases');

  const count = (values.databases || []).filter(name => name.startsWith(prefix)).length;
  const dirname = `${prefix}${count + 1}`;
  const dir = `${values.dir}/${dirname}`;

  try {
    // Create the database.
    const { db } = await databases.getOrCreate<ITestDbData>({ dir, dbKey, connect: true });
    events$.next({ type: 'CLI/db/select', payload: { dir } });
    if (name) {
      await db.put('.sys/dbname', name.toString());
    }
  } catch (error) {
    const err = `Failed while creating DB. ${error.message}`;
    e.props.error(err);
  }
});

/**
 * [Join] an existing DB.
 */
export const join = Command.create<P>('join', e => {
  console.log('join', join);
  // const dbKey = e.args.params[0] as string;
  // e.props.events$.next({ type: 'CLI/db/join', payload: { dbKey } });
});

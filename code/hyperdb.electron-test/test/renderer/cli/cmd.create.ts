import { Command } from '../common';
import * as t from './types';
import { ITestDbData, ICommandArgs } from '../../types';

type P = t.ITestCommandProps;

/**
 * Create a new [primary] DB.
 */
export const create = Command.create<P>('new', async e => {
  const { props, args } = e;
  const name = (args.params[0] || '').toString();
  const dbKey = undefined;
  await createDatabase({ name, dbKey, props, args });
});

/**
 * [Join] an existing DB.
 */
export const join = Command.create<P>('join', async e => {
  const { props, args } = e;
  const { params } = args;
  const dbKey = (params[0] || '').toString().replace(/\s/g, '');

  if (dbKey.length === 0) {
    return;
  }

  if (dbKey.length < 64) {
    return e.props.error('Database public-key must by 64 characters.');
  }

  await createDatabase({ name, dbKey, props, args });
});

/**
 * INTERNAL
 */
async function createDatabase(e: {
  name?: string;
  dbKey?: string;
  props: t.ITestCommandProps;
  args: ICommandArgs;
}) {
  const { name, dbKey } = e;
  const { databases, store, events$ } = e.props;
  const prefix = dbKey ? 'peer-' : 'primary-';

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
}

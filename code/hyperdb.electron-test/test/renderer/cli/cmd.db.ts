import { Command, value as valueUtil, hjson } from '../common';
import { watch, unwatch, updateWatch } from './cmd.watch';

import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [rename] the database.
 */
export const rename = Command.create<P>('rename', async e => {
  const { db } = e.props;
  const name = (e.args.params[0] || '').toString().trim();
  if (db && name) {
    db.put('.sys/dbname', name);
  }
});

/**
 * [put] write to the DB.
 */
export const put = Command.create<P>('put', async e => {
  const { db } = e.props;
  const params = e.args.params;
  const key = params[0];
  let value = params[1];

  if (typeof value === 'string' && valueUtil.isJson(value)) {
    try {
      value = hjson.parse(value);
    } catch (error) {
      // Ignore.  Just set the given value.
    }
  }

  if (db && key) {
    await db.put(key as any, value);
    await updateWatch({ db, addKeys: [key.toString()] });
  }
});

/**
 * [delete] delete a key from the DB
 */
export const del = Command.create<P>('delete', async e => {
  const { db } = e.props;
  const params = e.args.params;
  const key = params[0];
  if (db && key) {
    await db.delete(key as any);
  }
});

/**
 * all [values] in the DB
 */
export const values = Command.create<P>('values', async e => {
  const { db, events$ } = e.props;
  const params = e.args.params;
  const pattern = (params[0] || '').toString();
  if (db) {
    const values = await db.values({ pattern });
    events$.next({ type: 'CLI/db/values', payload: { values } });
  }
});

export const db = Command.create<P>('db')
  .add(put)
  .add(del)
  .add(values)
  .add(watch)
  .add(unwatch)
  .add(rename);

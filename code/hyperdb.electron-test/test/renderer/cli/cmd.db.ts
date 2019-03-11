import { Command, value as valueUtil, hjson } from '../common';
import { watch, unwatch, updateWatch } from './cmd.watch';

import * as t from './types';

type P = t.ICommandProps;

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

export const auth = Command.create<P>('auth', async e => {
  const { db } = e.props;
  const peerKey = e.args.params[0];
  if (db && typeof peerKey === 'string') {
    await db.authorize(peerKey);
  }
});

export const db = Command.create<P>('db')
  .add(put)
  .add(del)
  .add(watch)
  .add(unwatch)
  .add(auth);

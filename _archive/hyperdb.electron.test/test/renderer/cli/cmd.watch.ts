import { Command, R } from '../common';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [watch] values in the DB.
 */
export const watch = Command.create<P>('watch', async e => {
  const { db } = e.props;
  if (db) {
    const addKeys = e.args.params.map(p => p.toString());
    updateWatch({ db, addKeys });
  }
});

/**
 * [unwatch] values in the DB.
 */
export const unwatch = Command.create<P>('unwatch', async e => {
  const { db } = e.props;
  if (db) {
    let removeKeys = e.args.params.map(p => p.toString()) || [];
    if (removeKeys.includes('*')) {
      removeKeys = (await db.get('.sys/watch')).value || [];
    }
    updateWatch({ db, removeKeys });
  }
});

/**
 * Helper methods
 */
export async function updateWatch(args: {
  db: t.ITestRendererDb;
  addKeys?: string[];
  removeKeys?: string[];
}) {
  const { db, addKeys = [], removeKeys } = args;
  const current = (await db.get('.sys/watch')).value || [];
  let next = R.uniq([...current, ...addKeys]);
  next = !removeKeys ? next : next.filter(key => !removeKeys.includes(key));
  await db.put('.sys/watch', next);
  return next;
}

import { Command, R } from '../common';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [watch] values in the DB.
 */
export const watch = Command.create<P>('watch', async e => {
  const { db } = e.props;
  const keys = e.args.params.map(p => p.toString());
  return updateWatch({ db, keys });
});

/**
 *
 */
export async function updateWatch(args: { db: t.ITestRendererDb; keys: string[] }) {
  const { db, keys } = args;
  if (keys.length === 0) {
    return;
  }

  const current = (await db.get('.sys/watch')).value || [];
  const next = [...new Set([...current, ...keys])].map(item => item.toString());
  if (!R.equals(current, next)) {
    await db.put('.sys/watch', next);
  }

  return next;
}

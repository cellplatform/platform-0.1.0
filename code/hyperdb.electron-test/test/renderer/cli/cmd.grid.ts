import { Command } from '../common';
import * as t from './types';
import { uniq } from 'ramda';

type P = t.ITestCommandProps;

/**
 * [grid] editor.
 */
export const grid = Command.create<P>('grid').add('history', async e => {
  const { db } = e.props;
  const key = (e.args.params[0] || '').toString();
  if (db && key) {
    const dbKey = toDbKey(key.toUpperCase());
    const history = (await db.history(dbKey as any)).map(e => e.value);

    const payload = { data: { history } };
    e.props.events$.next({ type: 'CLI/rightPanel', payload });
  }
});

/**
 * [Helpers]
 */

function toCellKey(dbKey: string) {
  return dbKey.replace(/^cell\//, '');
}

function toDbKey(cellKey: string) {
  return `cell/${toCellKey(cellKey)}`;
}

import { shell } from 'electron';
import { Command } from '../common';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [db] status and global config.
 */
export const db = Command.create<P>('db')
  .add('new', e => e.props.events$.next({ type: 'CLI/db/new', payload: {} }))
  .add('join', e => {
    const dbKey = e.args.params[0] as string;
    e.props.events$.next({ type: 'CLI/db/join', payload: { dbKey } });
  })
  .add('rename', async e => {
    const { db } = e.props;
    const name = (e.args.params[0] || '').toString().trim();
    if (db && name) {
      db.put('.sys/dbname', name);
    }
  })
  .add('auth', async e => {
    const { db } = e.props;
    const peerKey = e.args.params[0];
    if (db && typeof peerKey === 'string') {
      await db.authorize(peerKey);
    }
  })
  .add('dir', async e => {
    const { db } = e.props;
    if (db) {
      shell.showItemInFolder(db.dir);
    }
  });

import { shell } from 'electron';
import { Command } from '../common';
import { editor } from './cmd.editor';
import { db } from './cmd.db';
import { network } from './cmd.network';
import * as t from './types';

type P = t.ICommandProps;

const newDb = Command.create<P>('new', e =>
  e.props.events$.next({ type: 'CLI/db/new', payload: {} }),
);
const joinDb = Command.create<P>('join', e => {
  const dbKey = e.args.params[0] as string;
  e.props.events$.next({ type: 'CLI/db/join', payload: { dbKey } });
});

export const auth = Command.create<P>('auth', async e => {
  const { db } = e.props;
  const peerKey = e.args.params[0];
  if (db && typeof peerKey === 'string') {
    await db.authorize(peerKey);
  }
});

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('hyperdb')
  // .add(newDb)
  // .add(joinDb)
  .add(auth)
  .add(db)
  .add(network)
  // .add(info)
  .add(editor);

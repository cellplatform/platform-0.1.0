import { shell } from 'electron';
import { Command } from '../common';
import { editor } from './cmd.editor';
import { db } from './cmd.db';
import { network } from './cmd.network';
import { info } from './cmd.db.info';
import { create, join } from './cmd.create';
import * as t from './types';

type P = t.ITestCommandProps;

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
  .add(create)
  .add(join)
  .add(info)
  .add(auth)
  .add(db)
  .add(network)
  .add(editor);

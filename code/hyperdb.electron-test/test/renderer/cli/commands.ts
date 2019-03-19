import { Command } from '../common';
import { create, join } from './cmd.create';
import { db } from './cmd.db';
import { info } from './cmd.db.info';
import { editor } from './cmd.editor';
import { grid } from './cmd.grid';
import { network } from './cmd.network';
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
  .add(editor)
  .add(grid);

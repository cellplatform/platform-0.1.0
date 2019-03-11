import { Command } from '../common';
import { info } from './cmd.info';
import { editor } from './cmd.editor';
import { db } from './cmd.db';
import { tmp } from './cmd.tmp';
import * as t from './types';

type P = t.ICommandProps;

const newDb = Command.create<P>('new', e =>
  e.props.events$.next({ type: 'CLI/db/new', payload: {} }),
);
const joinDb = Command.create<P>('join', e => {
  const dbKey = e.args.params[0] as string;
  e.props.events$.next({ type: 'CLI/db/join', payload: { dbKey } });
});

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('hyperdb')
  // .add(newDb)
  // .add(joinDb)
  .add(db)
  .add(info)
  .add(editor);

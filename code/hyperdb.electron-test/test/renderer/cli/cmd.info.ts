import { shell } from 'electron';
import { Command } from '../common';
import * as t from './types';

type P = t.ICommandProps;

export const rename = Command.create<P>('rename', async e => {
  const { db } = e.props;
  const name = (e.args.params[0] || '').toString().trim();
  if (db && name) {
    db.put('.sys/dbname', name);
  }
});

/**
 * [info] and global config values.
 */
export const info = Command.create<P>('info')
  .add(rename)
  .add('open-dir', async e => {
    const { db } = e.props;
    if (db) {
      shell.showItemInFolder(db.dir);
    }
  });

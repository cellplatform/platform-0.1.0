import { shell } from 'electron';
import { Command } from '../common';
import * as t from './types';


type P = t.ICommandProps;

export const dir = Command.create<P>('dir', async e => {
  const { db } = e.props;
  if (db) {
    shell.showItemInFolder(db.dir);
  }
});

/**
 * [info] and global config values.
 */
export const info = Command.create<P>('info').add(dir);

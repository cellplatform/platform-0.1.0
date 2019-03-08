import { shell } from 'electron';
import { Command } from '../common';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [tmp] Temporary debug command.
 */
export const tmp = Command.create<P>('tmp', async e => {
  const { db } = e.props;

  console.log('TMP', e);
  console.log('shell', shell);
  console.log('db', db);
  // shell.openItem('~/tmp');
  shell.showItemInFolder(db.dir);
});

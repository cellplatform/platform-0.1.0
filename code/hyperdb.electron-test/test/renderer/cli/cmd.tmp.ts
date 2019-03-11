import { shell } from 'electron';
import { Command } from '../common';
import * as t from './types';

type P = t.ICommandProps;

/**
 * [tmp] Temporary debug command.
 */
export const tmp = Command.create<P>('tmp', async e => {
  console.log('TMP', e);
});

import { Command } from '../common';
import * as t from './types';

/**
 * The root of the CLI application.
 */
export const root = Command.create<t.ICommandProps, t.ICommandOptions>('hyperdb')
  .add('status')
  .add('watch')
  .add({
    title: 'put',
    handler: e => {
      console.log('PUT', e);
    },
  });

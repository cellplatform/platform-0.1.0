import { Command } from '../common';
import * as t from './types';

/**
 * The root of the CLI application.
 */
export const root = Command.create<t.ITestCommandProps>('hyperdb')
  .add('status')
  .add('watch')
  .add({
    title: 'put',
    handler: e => {
      console.group('🌳 PUT');

      console.log('e', e);
      console.log('e.props', e.props);
      console.log('e.args', e.args);
      console.groupEnd();

      e.set('view', 'WATCH');
    },
  });
// .add(db);

const db = Command.create<t.ITestCommandProps>('db');

root.add(db);

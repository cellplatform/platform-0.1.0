import { constants, Command, t } from '../common';
const { shell } = require('electron').remote;

type P = t.ICommandProps & {};

/**
 * Manipulate the DB directly.
 */
const db = Command.create<P>('db')
  .add('a1', async e => {
    const value = (e.args.params[0] || '').toString();
    await e.props.db.put('cell/A1', value);
  })
  .add('b2', async e => {
    const value = (e.args.params[0] || '').toString();
    await e.props.db.put('cell/B2', value);
  });

/**
 * Debug options.
 */
const debug = Command.create<P>('debug')
  .add('show', e => e.props.state$.next({ showDebug: true }))
  .add('hide', e => e.props.state$.next({ showDebug: false }));

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root', e => {
  // Setup root screen.
})
  .add(db)
  .add(debug)
  .add('open-dir', async e => {
    shell.showItemInFolder(constants.DB.DIR);
  });

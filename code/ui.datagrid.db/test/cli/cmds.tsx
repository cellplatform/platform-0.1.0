import { log, constants, Command, t } from '../common';
const { shell } = require('electron').remote;

type P = t.ICommandProps & {};

/**
 * Manipulate the DB directly.
 */
const db = Command.create<P>('db')
  .add('cell', async e => {
    const key = `cell/${e.param<string>(0, 'A1').toUpperCase()}`;
    const value = e.param(1);
    await e.props.db.put(key, value);
  })
  .add('column', async e => {
    const key = `column/${e.param<string>(0, 'A').toUpperCase()}`;
    const width = e.param(1, 120);
    await e.props.db.put(key, { width });
  })
  .add('row', async e => {
    const key = `row/${e.param<number>(0, 0)}`;
    const height = e.param(1, 80);
    await e.props.db.put(key, { height });
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
  .add('open-folder', async e => {
    const DB = constants.DB;
    const dir = DB.DIR;
    log.info(`database file: ${DB.FILE}`);
    log.info(`opening folder: ${dir}`);
    shell.showItemInFolder(dir);
  })
  .add('find', async e => {
    const db = e.props.db;
    const res = await db.find('cell/**');
    log.info('find:', res);
  })
  .add('compact', async e => {
    const sync = e.props.sync;
    const res = await sync.compact();
    log.info('compact', res);
  });

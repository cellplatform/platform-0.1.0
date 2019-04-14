import { constants, Command, t } from '../common';

type P = t.ICommandProps & {};

/**
 * Manipulate the DB directly.
 */
const db = Command.create<P>('db')
  .add('a1', async e => {
    const value = (e.args.params[0] || '').toString();
    const db = e.props.db;
    // const foo = await db.get('foo');
    // console.log('foo', foo);
    const key = 'cell/A1';
    await db.put<any>(key, value);
    const res = await db.get<any>(key);
    console.log('res', res);
  })
  .add('b2', async e => {
    const db = e.props.db;
    await db.put('foo', 123);
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
  .add('tmp', async e => {
    await e.props.databases.getOrCreate({ dir: constants.DB.DIR });
  });

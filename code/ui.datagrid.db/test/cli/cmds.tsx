import { constants, Command, t } from '../common';

type P = t.ICommandProps & {};

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root', e => {
  // Setup root screen.
  e.props.state$.next({ dir: e.props.db.dir });
})
  .add('show', e => e.props.state$.next({ showDebug: true }))
  .add('hide', e => e.props.state$.next({ showDebug: false }))
  .add('get-foo', async e => {
    const db = e.props.db;
    const foo = await db.get('foo');
    console.log('foo', foo);
  })
  .add('put-foo', async e => {
    const db = e.props.db;
    await db.put('foo', 123);
  })
  .add('tmp', async e => {
    await e.props.databases.getOrCreate({ dir: constants.DB.DIR });
  });

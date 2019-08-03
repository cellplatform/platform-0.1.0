import { log, Command, t } from '../common';

type P = t.ICommandProps;

export const DEFAULT = {
  DB: 'nedb:tmp/db-1.db',
};

/**
 * Sample commands.
 */
export const root = Command.create<P>('root', e => null)
  .add('db', e => {
    const param = e.param(0, 'db-1');
    const name = typeof param === 'number' ? `db-${param}` : param;
    const kind = e.param<string>(1, 'nedb');
    const db = `${kind}:tmp/${name}`;
    log.info(db);
    e.props.db(db).dispose();
    e.props.next({ current: db });
  })
  .add('get', async e => {
    const db = e.props.current;
    const res = await db.get(e.param(0) || 'foo');
    log.info('GET', res);
  })
  .add('find', async e => {
    const db = e.props.current;
    const pattern = e.param<string>(0, '**');
    const res = await db.find(pattern);

    log.info('\nFIND', res);

    if (e.props.state.current) {
      const databases = { ...(e.props.state.databases || {}), [e.props.state.current]: res.map };
      e.props.next({ databases });
    }
  })
  .add('put', e => {
    const db = e.props.current;
    db.put(e.param(0) || 'foo', e.param(1));
  })
  .add('putMany', async e => {
    const db = e.props.current;
    const value = e.param(0);
    const res = await db.putMany([
      { key: 'foo', value },
      { key: 'bar', value },
      { key: 'baz', value },
    ]);
    log.info('putMany', res);
  })
  .add('delete', e => {
    const db = e.props.current;
    db.delete(e.param(0) || 'foo');
  })
  .add('delete-all', async e => {
    const db = e.props.current;
    const all = await db.find('**');

    console.log('all', all);

    const res = await db.deleteMany(all.keys);
    log.info('deleted', res);
  })
  .add('open-folder', e => {
    const db = e.props.state.current || '';
    e.props.ipc.send<t.IDbIpcOpenFolderEvent>('DB/open/folder', { conn: db });
  });

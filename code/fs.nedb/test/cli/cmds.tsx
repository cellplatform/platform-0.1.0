import { log, Command, t, Store } from '../common';

type P = t.ICommandProps;

/**
 * Sample commands.
 */
export const root = Command.create<P>('root')
  //
  .add('store', async e => {
    const db = Store.create({ filename: 'tmp/client.db', autoload: true });

    const res1 = await db.findOne({ name: 'foo' });
    log.info(`BEFORE insert`, res1);

    await db.insert({ name: 'foo' });

    const res2 = await db.findOne({ name: 'foo' });
    log.info(`AFTER insert`, res1);
  });

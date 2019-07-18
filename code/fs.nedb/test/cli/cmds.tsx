import { log, Command, t, Nedb } from '../common';

type P = t.ICommandProps;

/**
 * Sample commands.
 */
export const root = Command.create<P>('root')
  //
  .add('store', async e => {
    const db = e.props.db;
    const name = 'foo';
    const value = e.param(0, 'my-value');

    const res1 = await db.findOne({ name });
    log.info(`BEFORE insert`, res1);

    await db.insert({ name, value });

    const res2 = await db.findOne({ name });
    log.info(`AFTER insert`, res1);
  })
  .add('compact', async e => {
    const db = e.props.db;
    await db.compact();
  });

import { Command, value as valueUtil, hjson } from '../common';
import { updateWatch } from './cmd.watch';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [put] write to the DB.
 */
export const put = Command.create<P>('put', async e => {
  const { db } = e.props;
  const params = e.args.params;
  const key = params[0];
  let value = params[1];

  if (typeof value === 'string' && valueUtil.isJson(value)) {
    try {
      value = hjson.parse(value);
    } catch (error) {
      // Ignore.  Just set the given value.
    }
  }

  if (db && key) {
    await db.put(key as any, value);
    await updateWatch({ db, addKeys: [key.toString()] });
  }
});

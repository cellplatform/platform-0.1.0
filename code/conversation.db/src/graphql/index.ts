import { t } from '../common';
import { init as initSchema } from './schema';

/**
 * Initializes the graphql API.
 */
export function init(args: { getDb: t.GetDb; keys?: t.MsgKeys }) {
  const { getDb, keys } = args;
  const schema = initSchema({ getDb, keys });
  return { schema };
}

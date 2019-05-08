import { t } from '../common';
import { init as initSchema } from './schema';

/**
 * Initializes the graphql API.
 */
export function init(args: { getDb: t.GetConverstaionDb }) {
  const { getDb } = args;
  const schema = initSchema({ getDb });
  return { schema };
}

import { init as initSchema } from './schema';

/**
 * Initializes the graphql API.
 */
export function init(args: {}) {
  const schema = initSchema({});
  return { schema };
}

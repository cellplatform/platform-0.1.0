import { constants, ENV, fs, t } from '../common';
import { app } from './typeDef.app';
import { init } from './typeDef.init';

export { app };

const SYS = constants.SYS;

/**
 * Creates the type-defs if they don't already exist in the DB.
 */
export async function ensureExists(args: { client: t.IClientTypesystem; force?: boolean }) {
  const { client, force } = args;
  let created = false;

  // Write type-defs.
  if (force || !(await client.http.ns(SYS.NS.TYPE).exists())) {
    const defs = init();
    await Promise.all(Object.keys(defs).map((ns) => client.http.ns(ns).write(defs[ns])));
    if (ENV.isDev) {
      const ts = await client.typescript(SYS.NS.TYPE);
      await ts.save(fs, fs.resolve('src/types.g'));
    }
    created = true;
  }

  // Write root "apps" data sheet.
  const data = client.http.ns(SYS.NS.DATA);
  if (force || !(await data.exists())) {
    await data.write({ ns: { type: { implements: SYS.NS.TYPE } } });
    created = true;
  }

  // Finish up.
  return { created };
}

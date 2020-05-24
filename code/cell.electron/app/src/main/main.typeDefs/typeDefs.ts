import '../../config';

import { constants, ENV, fs, t } from '../common';
import * as app from './type.app';
import { define } from './typeDefs.define';

export { app };

const SYS = constants.SYS;

/**
 * Creates the type-defs if they don't already exist.
 */
export async function ensureExists(args: { client: t.IClientTypesystem }) {
  const { client } = args;
  let created = false;

  // Write type-defs.
  if (!(await client.http.ns(SYS.NS.TYPE).exists())) {
    const defs = define();
    await Promise.all(Object.keys(defs).map((ns) => client.http.ns(ns).write(defs[ns])));
    if (ENV.isDev) {
      const ts = await client.typescript(SYS.NS.TYPE);
      await ts.save(fs, fs.resolve('src/types.g'));
    }
    created = true;
  }

  // Write root "apps" data sheet.
  const data = client.http.ns(SYS.NS.DATA);
  if (!(await data.exists())) {
    await data.write({ ns: { type: { implements: SYS.NS.TYPE } } });
    created = true;
  }

  // Finish up.
  return { created };
}

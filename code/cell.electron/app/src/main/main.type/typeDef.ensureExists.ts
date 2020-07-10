import { AppSchema, ConfigFile, t } from '../common';

/**
 * Creates the type-defs if they don't already exist in the DB.
 */
export async function ensureExists(args: { client: t.IClientTypesystem; force?: boolean }) {
  const { client, force } = args;
  const http = client.http;
  const config = await ConfigFile.read();

  let created = false;

  // Write type-defs.
  if (force || !config.ns.appType || !(await http.ns(config.ns.appType).exists())) {
    const res = AppSchema.declare();
    config.ns.appType = res.namespaces.App; // NB: Save generated namespace URI (cuid) to local config file.

    const defs = res.toObject();
    await Promise.all(Object.keys(defs).map((ns) => http.ns(ns).write(defs[ns])));
    created = true;
  }

  // Write "apps" data sheet.
  const data = http.ns(config.ns.appData);
  if (force || !(await data.exists())) {
    await data.write({ ns: { type: { implements: config.ns.appType } } });
    created = true;
  }

  // Finish up.
  await ConfigFile.write(config);
  return { created };
}

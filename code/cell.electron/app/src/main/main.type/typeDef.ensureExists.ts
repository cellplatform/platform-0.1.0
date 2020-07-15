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
    const schema = AppSchema.declare();
    config.ns.appType = schema.namespaces.App; // NB: Save generated namespace URI (cuid) to local config file.

    const res = await schema.write(http);
    if (!res.ok) {
      const messages = res.errors.map((e) => e.error.message).join(',');
      throw new Error(`Failed while saving type-defs: ${messages}`);
    }

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

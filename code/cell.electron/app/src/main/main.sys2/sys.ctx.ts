import { t, constants } from '../common';

/**
 * Generates the shared context.
 */
export async function toContext(client: t.IClientTypesystem) {
  const sheet = await client.sheet<t.App>(constants.SYS.ROOT.DATA);
  const apps = await sheet.data('App').load();
  const host = client.http.origin;
  const ctx: t.IContext = { host, client, sheet, apps, windowRefs: [] };
  return ctx;
}

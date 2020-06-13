import { Subject } from 'rxjs';

import { constants, t } from '../common';

/**
 * Generates the shared context.
 */
export async function toContext(args: {
  client: t.IClientTypesystem;
  event$: Subject<t.AppEvent>;
}) {
  const { client, event$ } = args;
  const sheet = await client.sheet<t.App>(constants.SYS.NS.DATA);
  const apps = await sheet.data('App').load();
  const host = client.http.origin;
  const ctx: t.IContext = { host, client, sheet, apps, windowRefs: [] };
  return ctx;
}

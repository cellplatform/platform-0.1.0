import { Observable } from 'rxjs';
import { t } from '../common';

/**
 * Generates the shared context.
 */
export async function toContext(args: {
  config: t.IConfigFile;
  client: t.IClientTypesystem;
  event$: Observable<t.AppEvent>;
}) {
  const { config, client, event$ } = args;

  const sheet = await client.sheet<t.App>(config.ns.appData);
  const apps = await sheet.data('App').load();

  const ctx: t.IContext = { client, sheet, apps, windowRefs: [], event$ };
  return ctx;
}

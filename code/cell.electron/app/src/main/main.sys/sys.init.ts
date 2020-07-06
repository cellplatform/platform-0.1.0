import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { ConfigFile, rx, t } from '../common';
import { typeDef } from '../main.type';
import { toContext } from './sys.ctx';
import * as types from './sys.init.types';
import { ipc } from './sys.ipc';
import { monitor } from './sys.monitor';

/**
 * Initialize the system.
 */
export async function init(args: { client: t.IClientTypesystem; event$: Subject<t.AppEvent> }) {
  const { client, event$ } = args;

  // Ensure the root "app" type-definitions exist in the database.
  await typeDef.ensureExists({ client });

  // Build the shared context and setup event listeners.
  const config = await ConfigFile.read();
  const ctx = await toContext({ config, client, event$ });
  monitor({ ctx, event$ });
  ipc({ ctx, event$ });

  // Initialize application type-defs.
  if (ctx.apps.total === 0) {
    await types.define(ctx);

    // Wait for save to complete.
    await rx
      .payload<t.ITypedSheetSavedEvent>(event$, 'SHEET/saved')
      .pipe(
        filter((e) => e.sheet.uri.toString() === config.ns.appData),
        take(1),
      )
      .toPromise();
    await ctx.apps.load();
  }

  // Finish up.
  return ctx;
}

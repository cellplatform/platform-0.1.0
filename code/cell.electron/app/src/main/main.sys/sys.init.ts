import '../../config';

import { t } from '../common';
import { typeDefs } from '../main.typeDefs';
import { toContext } from './sys.ctx';
import { defineAppTypes } from './sys.init.define';
import { ipc } from './sys.ipc';
import { monitor } from './sys.monitor';

/**
 * Initialize the system.
 */
export async function init(client: t.IClientTypesystem) {
  // Ensure the root "app" type-definitions exist in the database.
  const { created } = await typeDefs.ensureExists({ client });

  // Build the shared context and setup event listeners.
  const ctx = await toContext(client);
  monitor({ ctx });

  // Initialize application type-defs.
  defineAppTypes(ctx);

  // Finish up.
  ipc({ ctx });
  return ctx;
}

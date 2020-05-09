import '../../config';

import { constants, t, time } from '../common';
import { toContext } from './sys.ctx';
import { typeDefs } from '../main.typeDefs';
import { ipc } from './sys.ipc';
import { monitor } from './sys.monitor';

const { paths } = constants;

/**
 * Initialize the system.
 */
export async function init(client: t.IClientTypesystem) {
  // Ensure the root "app" type-definitions exist in the database.
  const { created } = await typeDefs.ensureExists({ client });

  // Build the shared context and setup event listeners.
  const ctx = await toContext(client);
  monitor({ ctx });

  // Define base modules.
  const res = await typeDefs.app.define({
    ctx,
    name: '@platform/cell.ui.sys',
    entryPath: 'entry.html',
    bundleDir: paths.bundle.sys,
  });

  // Finish up.
  ipc({ ctx });
  return ctx;
}

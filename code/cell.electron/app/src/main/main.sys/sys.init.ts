import '../../config';

import { constants, t } from '../common';
import { toContext } from './sys.ctx';
import * as app from './sys.def.app';
import * as types from './sys.def.types';
import { ipc } from './sys.ipc';
import { monitor } from './sys.monitor';

const { paths } = constants;

/**
 * Initialize the system.
 */
export async function init(client: t.IClientTypesystem) {
  // Ensure the root "app" type-definitions exist in the database.
  await types.ensureExists({ client });

  // Build the shared context and setup event listeners.
  const ctx = await toContext(client);
  monitor({ ctx });

  // Define base modules.
  const res = await app.define({
    ctx,
    name: '@platform/cell.ui.sys',
    entryPath: 'entry.html',
    bundleDir: paths.bundle.sys,
  });

  // Finish up.
  ipc({ ctx });
  return ctx;
}

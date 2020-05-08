import '../../config';
import { constants, t, log } from '../common';
import * as types from './sys.define.types';
import * as app from './sys.define.app';
import { monitor } from './sys.monitor';
import { toContext } from './sys.ctx';

const { SYS, paths } = constants;

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
  return ctx;
}

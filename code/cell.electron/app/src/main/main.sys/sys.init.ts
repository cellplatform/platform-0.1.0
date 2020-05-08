import { constants, fs, t, Uri, time, value } from '../common';
import { monitor } from './sys.monitor';
import { DEFS } from './sys.typeDefs';
import { upload } from './sys.upload';
import { ipc } from './sys.ipc';

const SYS = constants.SYS;
const NS = SYS.NS;

/**
 * Writes (initializes) system data.
 */
export async function initContext(client: t.IClientTypesystem) {
  const host = client.http.origin;
  const ns = client.http.ns(NS.APP);

  // Ensure the root application sheet exists in the DB.
  if (!(await ns.exists())) {
    await ns.write({ ns: { type: { implements: NS.TYPE.APP } } });
  }

  // Load the app model.
  const sheet = await client.sheet<t.SysApp>(NS.APP);
  monitor({ client, sheet });

  const app = sheet.data('SysApp').row(0);
  await app.load();

  // Retrieve windows.
  const windows = await app.props.windows.load();
  const windowDefs = await app.props.windowDefs.load();

  // Finish up.
  const ctx: t.IAppCtx__OLD = {
    host,
    client,
    sheet,
    app,
    windows,
    windowDefs,
    windowRefs: [],
  };

  ipc({ ctx });
  return ctx;
}

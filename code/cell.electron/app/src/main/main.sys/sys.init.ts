import { constants, fs, t, Uri } from '../common';
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

  // Ensure the root application model exists in the DB.
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
  const ctx: t.IAppCtx = {
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

/**
 * Write the application types.
 */
export async function initTypeDefs(client: t.IClientTypesystem, options: { save?: boolean } = {}) {
  const write = async (ns: string) => {
    if (!DEFS[ns]) {
      throw new Error(`namespace "${ns}" is not defined.`);
    }
    await client.http.ns(ns).write(DEFS[ns]);
  };

  await write(NS.TYPE.APP);
  await write(NS.TYPE.WINDOW_DEF);
  await write(NS.TYPE.WINDOW);

  if (options.save) {
    const ts = await client.typescript(NS.TYPE.APP);
    await ts.save(fs, fs.resolve('src/types.g'));
  }
}

/**
 * Creates the new window definition.
 */
export async function initWindowDef(args: {
  kind: string;
  ctx: t.IAppCtx;
  uploadDir?: string | string[];
  force?: boolean;
}) {
  const { ctx, kind, uploadDir } = args;
  const defs = await ctx.windowDefs.data();
  const exists = defs.rows.some(def => def.props.kind === kind);
  if (exists && !args.force) {
    return;
  }

  const def = defs.row(0);
  def.props.kind = kind;

  if (uploadDir) {
    const host = ctx.host;
    const targetCell = Uri.create.cell(def.uri.ns, 'A1');
    const dirs = Array.isArray(uploadDir) ? uploadDir : [uploadDir];

    for (const sourceDir of dirs) {
      const targetDir = fs.basename(sourceDir);
      await upload({ host, targetCell, sourceDir, targetDir });
    }
  }
}

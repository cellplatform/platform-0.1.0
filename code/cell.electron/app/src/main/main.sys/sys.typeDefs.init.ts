import { constants, fs, t, Uri } from '../common';
import { DEFS } from './sys.typeDefs';
import { upload } from './sys.upload';

const SYS = constants.SYS;
const NS = SYS.NS;

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
  ctx: t.IAppCtx__OLD;
  kind: string;
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

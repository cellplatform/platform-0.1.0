import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Client, constants, fs, log, t, Uri } from '../common';
import { upload } from './sys.upload';

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
  client.changes.watch(sheet);

  const saver = Client.saveMonitor({ client, debounce: 300 });
  saveLogger(saver.saved$);

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
  };
  return ctx;
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

/**
 * [Helpers]
 */

function saveLogger(saved$: Observable<t.ITypedSheetSaved>) {
  // Models saved.
  saved$.subscribe(e => {
    const prefix = e.ok ? log.blue('SAVED') : log.red('SAVED (error)');
    log.info(prefix);

    if (e.changes.ns) {
      const ns = e.sheet.uri.id;
      log.info.gray(`${log.green('ns')}:${ns}`);
    }

    const cells = e.changes.cells || {};
    Object.keys(cells).forEach(key => {
      const change = cells[key];
      const ns = change.ns.replace(/^ns\:/, '');
      const cell = log.gray(`${log.green('cell')}:${ns}:${log.green(change.key)}`);
      log.info(`  ${cell}`);
    });
  });

  // Divider
  saved$.pipe(debounceTime(800)).subscribe(() => log.info.gray('━'.repeat(60)));
}

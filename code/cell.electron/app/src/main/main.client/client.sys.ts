import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';

import { Client, t, time, constants, Uri, fs, log } from '../common';
import * as sync from './client.sync';
import { upload } from './client.upload';

const SYS = constants.SYS;
const NS = SYS.NS;

/**
 * Writes (initializes) system data.
 */
export async function getOrCreateSystemContext(host: string) {
  const http = Client.http(host);
  const ns = http.ns(NS.APP);

  // Ensure the root application model exists in the DB.
  if (!(await ns.exists())) {
    await ns.write({ ns: { type: { implements: NS.TYPE.APP } } });
  }

  const flush$ = new Subject<{}>();
  const saved$ = new Subject<{}>();
  saved$.pipe(debounceTime(800)).subscribe(() => log.info.gray('━'.repeat(60)));

  // Load the app model.
  const type = Client.type({ http });
  const sheet = await type.sheet<t.CellApp>(NS.APP);
  sync.saveMonitor({ http, state: sheet.state, flush$, saved$ });

  const app = sheet.data('CellApp').row(0);
  await app.load();

  // Retrieve windows.
  const windows = await app.props.windows.load();
  const windowDefs = await app.props.windowDefs.load();

  // TEMP: setup save monitor(s).
  sync.saveMonitor({ http, state: windows.sheet.state, flush$, saved$ });
  sync.saveMonitor({ http, state: windowDefs.sheet.state, flush$, saved$ });

  // Finish up.
  const ctx: t.IAppCtx = {
    host,
    sheet,
    app,
    windows,
    windowDefs,
    async flush() {
      flush$.next();
      await time.wait(300); // HACK: this ensures the changes are flushed to the DB. Do this in a more predictable way.
    },
  };
  return ctx;
}

/**
 * Creates the IDE window definition.
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

  // Finish up.
  await ctx.flush();
}

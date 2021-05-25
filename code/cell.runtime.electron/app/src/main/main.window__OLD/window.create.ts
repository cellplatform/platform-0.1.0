import { filter, take, tap } from 'rxjs/operators';

import { rx, t } from '../common';
import { createBrowserWindow } from './window.create.browser';

/**
 * Create an electron window for the given app.
 */
export async function createOne(args: { ctx: t.IContext; name: string; argv?: string[] }) {
  const { ctx } = args;
  const { apps, event$ } = ctx;
  const argv = (args.argv || []).filter((arg) => Boolean((arg || '').trim()));

  /**
   * 🐷 HACK TEMP:
   *    This force loads all rows which may be needed when the data-set
   *    has sync/resized.
   * TODO:
   *    Don't do this here, put this somewhere more sensible
   *    of make some kind of "force load" method
   *
   */

  const reload = async () => {
    const wait = Array.from({ length: apps.total }).map((v, i) => apps.row(i).load());
    await Promise.all(wait);
  };
  await reload();

  // Retrieve the app definition.
  const app = apps.find((row) => row.name === args.name);
  if (!app) {
    throw new Error(`An app definition named '${args.name}' not found.`);
  }

  // Prepare the data model.
  const windows = await app.props.windows.data();
  const window = windows.row(windows.total);
  window.props.app = `=${app.uri.toString()}`; // NB: REF to the defining [App].
  window.props.argv = argv;

  /**
   * TODO 🐷
   * - move to method somewhere sensible
   * - name: `waitForSave`
   */
  // TEMP 🐷- move to method somewhere sensible
  //
  await rx
    .payload<t.ITypedSheetSavedEvent>(event$, 'TypedSheet/saved')
    .pipe(
      filter((e) => e.sheet.uri.id === window.uri.ns),
      take(1),
      // delay(500),
      tap((e) => {
        console.log('SAVED', e.sheet.uri.toString());
      }),
    )
    .toPromise();

  // Finish up.
  return createBrowserWindow({ ctx, app, window });
}

/**
 * Create all windows.
 */
export async function createAll(args: { ctx: t.IContext }) {
  const { ctx } = args;
  const { apps } = ctx;
  for (const app of apps.rows) {
    const windows = await app.props.windows.data();
    for (const window of windows.rows) {
      await createBrowserWindow({ ctx, app, window });
    }
  }
}

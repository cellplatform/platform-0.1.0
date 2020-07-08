import { t, util, time } from '../common';
import { createBrowserWindow } from './window.create.browser';

/**
 * Create an electron window for the given app.
 */
export async function createOne(args: { ctx: t.IContext; name: string }) {
  const { ctx } = args;
  const { apps } = ctx;

  /**
   * 🐷HACK TEMP:
   *    This force loads all rows which may be needed when the data-set
   *    has sync/resized.
   * TODO:
   *    Don't do this here, put this somewhere more sensible
   *    of make some kind of "force load" method
   *
   */
  // const wait = Array.from({ length: apps.total }).map((v, i) => apps.row(i).load());
  // await Promise.all(wait);

  // Retrieve the app definition.
  const app = apps.find((row) => row.name === args.name);
  if (!app) {
    throw new Error(`An app definition named '${args.name}' not found.`);
  }

  // Prepare the data model.
  const windows = await app.props.windows.data();
  const window = windows.row(windows.total);
  window.props.app = `=${app.uri.toString()}`; // NB: REF to the defining [App].

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

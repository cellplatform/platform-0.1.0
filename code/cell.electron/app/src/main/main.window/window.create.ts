import { t } from '../common';
import { createBrowserWindow } from './window.browser';

/**
 * Create an electron window for the given app.
 */
export async function createOne(args: { ctx: t.IContext; name: string }) {
  const { ctx } = args;
  const { apps } = ctx;

  // Retrieve the app definition.
  const app = apps.find(row => row.name === args.name);
  if (!app) {
    throw new Error(`An app definition named '${args.name}' not found.`);
  }

  // Prepare the data model.
  const windows = await app.props.windows.data();
  const window = windows.row(windows.total);
  window.props.app = app.props.name;

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

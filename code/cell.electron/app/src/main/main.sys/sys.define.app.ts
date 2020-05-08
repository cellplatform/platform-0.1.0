import { t } from '../common';
import { upload } from './sys.upload';

/**
 * Define an application module.
 */
export async function define(args: {
  ctx: t.IContext;
  name: string;
  bundleDir: string;
  entryPath: string;
  force?: boolean;
}) {
  const { ctx } = args;
  const { client, apps } = ctx;
  const exists = Boolean(apps.find(row => row.name === args.name));

  // Create the app model in the sheet.
  if (!exists || args.force) {
    const app = apps.row(apps.total);
    app.props.name = args.name;
    app.props.bundle = args.entryPath;

    // Upload the bundle as files to the cell (filesystem).
    await upload({
      host: client.http.origin,
      targetCell: app.types.map.bundle.uri,
      sourceDir: args.bundleDir,
    });
  }

  const app = apps.find(row => row.name === args.name);
  return { app, created: !exists };
}

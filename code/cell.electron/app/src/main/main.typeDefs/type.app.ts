import { t, util, fs } from '../common';

/**
 * Define an application module.
 */
export async function define(args: {
  ctx: t.IContext;
  row: number;
  name: string;
  sourceDir: string;
  entryPath: string;
  devPort: number;
  initialWidth: number;
  initialHeight: number;
  force?: boolean;
}) {
  const { ctx } = args;
  const { client, apps } = ctx;
  const exists = Boolean(apps.find((row) => row.name === args.name));

  // Create the app model in the sheet.
  if (!exists || args.force) {
    const entry = args.entryPath;
    const targetDir = fs.dirname(entry);

    const app = apps.row(args.row);
    const props = app.props;
    props.name = args.name;
    props.entry = args.entryPath;
    props.devPort = args.devPort;
    props.initialWidth = args.initialWidth;
    props.initialHeight = args.initialHeight;

    // Upload the bundle as files to the cell (filesystem).
    await util.upload({
      host: client.http.origin,
      targetCell: app.types.map.fs.uri,
      sourceDir: args.sourceDir,
      targetDir,
    });
  }

  const app = apps.find((row) => row.name === args.name);
  return { app, created: !exists };
}

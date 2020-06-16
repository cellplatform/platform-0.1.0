import { t, util, fs } from '../common';

/**
 * Define an application module.
 */
export async function add(args: {
  ctx: t.IContext;
  row: number;
  sourceDir: string;
  force?: boolean;
  props: {
    name: string;
    entryPath: string;
    devPort: number;
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    devTools?: boolean;
  };
}) {
  const { ctx } = args;
  const { client, apps } = ctx;

  const exists = Boolean(apps.find((row) => row.name === args.props.name));
  const create = !exists || args.force;

  // Create the app model in the sheet.
  if (create) {
    const entry = args.props.entryPath;
    const targetDir = fs.dirname(entry);

    const app = apps.row(args.row);
    const props = app.props;
    props.name = args.props.name;
    props.entry = args.props.entryPath;
    props.devPort = args.props.devPort;
    props.devTools = args.props.devTools || false;
    props.width = args.props.width;
    props.height = args.props.height;
    props.minWidth = args.props.minWidth;
    props.minHeight = args.props.minHeight;
    props.bytes = (await fs.size.dir(args.sourceDir)).bytes;

    // Upload the bundle as files to the cell (filesystem).
    await util.upload({
      host: client.http.origin,
      targetCell: app.types.map.fs.uri,
      sourceDir: args.sourceDir,
      targetDir,
    });
  }

  const app = apps.find((row) => row.name === args.props.name);
  return { app, created: create };
}

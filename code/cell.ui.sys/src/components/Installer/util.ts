import { AppManifest, t } from '../../common';

export async function installBundle(args: {
  ctx: t.IAppContext;
  dir: string;
  files: t.IHttpClientCellFileUpload[];
}) {
  const { ctx, dir, files = [] } = args;
  const { client } = ctx;

  if (!dir) {
    throw new Error(`The dropped item was not a folder.`);
  }

  const ns = ctx.window.app.uri.toString();
  const manifest = AppManifest.fromFiles(files);
  const bundle = await manifest.bundle({ client, dir, files, ns });
  const { changes, app } = await bundle.save({ upload: false }); // NB: Defer upload until IPC sync completes.

  await ctx.sheetChanged(changes);
  await bundle.upload(app);
}

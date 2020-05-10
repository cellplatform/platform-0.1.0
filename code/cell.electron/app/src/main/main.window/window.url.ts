import { ENV, Schema, t, util } from '../common';

/**
 * Generates the URL for the given app.
 */
export async function getUrl(args: { host: string; app: t.ITypedSheetRow<t.App> }) {
  const { app } = args;
  const { props, types } = app;
  const isDev = ENV.isDev;

  const urls = Schema.urls(args.host);
  const bundleUri = types.map.fs.uri;
  const entry = urls
    .cell(bundleUri)
    .file.byName(props.entry)
    .toString();

  const dev = await getDevUrl({ app });

  return {
    entry,
    dev,
    toString: () => (isDev && dev.isRunning ? dev.entry : entry),
  };
}

/**
 * Generates the dev URL.
 */
export async function getDevUrl(args: { app: t.ITypedSheetRow<t.App> }) {
  const { props } = args.app;
  const port = props.devPort;
  const isRunning = await util.port.isUsed(port);
  const isDev = ENV.isDev;
  const entry = `http://localhost:${port}`;
  return {
    isRunning,
    entry,
    port,
    toString: () => (isDev ? entry : ''),
  };
}

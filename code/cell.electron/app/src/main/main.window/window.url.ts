import { ENV, Schema, t } from '../common';

/**
 * Generates the URL for the given app.
 */
export function getUrl(args: { host: string; app: t.ITypedSheetRow<t.App> }) {
  const urls = Schema.urls(args.host);
  const bundleUri = args.app.types.map.fs.uri;
  const entry = urls
    .cell(bundleUri)
    .file.byName(args.app.props.entry)
    .toString();
  const dev = ENV.isDev ? 'http://localhost:1234' : '';
  const url = dev || entry;
  return { url, entry, dev, toString: () => url };
}

import { fs, Genesis, slug, t, Urls } from '../common';

/**
 * Bundle status logic
 */
export function StatusController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
  http: t.IHttpClient;
}) {
  const { events, http, bus } = args;
  const host = http.origin;

  /**
   * Retrieve the status of a local bundle.
   */
  events.status.req$.subscribe(async (e) => {
    const { tx = slug(), dir } = e;
    const genesis = Genesis(http);

    const path = `${dir.replace(/\/$/, '')}/index.json`;
    const client = http.cell(e.cell ?? (await genesis.modules.uri()));
    const cell = client.uri.toString();
    const file = client.fs.file(path);

    if (!(await file.exists())) {
      return bus.fire({
        type: 'runtime.electron/Bundle/status:res',
        payload: { tx, exists: false },
      });
    }

    const manifest = (await file.download()).body as t.BundleManifest;
    const entry = fs.join(dir, manifest.bundle.entry);
    const url = Urls.create(host).cell(cell).file.byName(entry).toString();
    const status: t.BundleStatus = { host, cell, dir, url, manifest };

    return bus.fire({
      type: 'runtime.electron/Bundle/status:res',
      payload: { tx, exists: true, status },
    });
  });
}
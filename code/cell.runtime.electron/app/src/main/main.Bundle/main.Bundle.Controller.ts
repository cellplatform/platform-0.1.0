import { ConfigFile, HttpClient, rx, slug, t, Uri, util, Urls, fs } from '../common';
import { Events } from './main.Bundle.Events';

/**
 * Behavioral event controller.
 */
export function Controller(args: { bus: t.EventBus<any>; host: string }) {
  const { host } = args;
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  const defaultCellUri = async () => {
    const config = await ConfigFile.read();
    return Uri.create.cell(config.refs.genesis, 'A1');
  };

  /**
   * Retrieve the status of a local bundle.
   */
  events.status.req$.subscribe(async (e) => {
    const { tx = slug(), dir } = e;

    const path = `${dir.replace(/\/$/, '')}/index.json`;
    const client = HttpClient.create(host).cell(e.cell ?? (await defaultCellUri()));
    const cell = client.uri.toString();
    const file = client.file.name(path);

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

  /**
   * Upload bundles to the local server.
   */
  events.upload.req$.subscribe(async (e) => {
    const { sourceDir, targetDir, silent, tx = slug() } = e;

    const current = await events.status.get({ dir: targetDir });
    if (current && !e.force) {
      const files = current.manifest.files.map(({ path, bytes }) => ({ path, bytes }));
      return bus.fire({
        type: 'runtime.electron/Bundle/upload:res',
        payload: { tx, ok: true, files, errors: [], action: 'unchanged' },
      });
    }

    const targetCell = await defaultCellUri();
    const res = await util.upload({ host, targetCell, sourceDir, targetDir, silent });
    const { ok, errors } = res;
    const files = res.files.map(({ filename, data }) => ({
      path: filename,
      bytes: data.byteLength,
    }));

    const action = Boolean(current) ? 'replaced' : 'written';
    return bus.fire({
      type: 'runtime.electron/Bundle/upload:res',
      payload: { tx, ok, files, errors, action },
    });
  });

  return { dispose, dispose$ };
}

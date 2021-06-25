import { fs, Genesis, HttpClient, rx, slug, t, Urls } from '../common';
import { UploadController } from './main.Bundle.Controller.upload';
import { Events } from './main.Bundle.Events';

/**
 * Bundle behavior logic.
 */
export function Controller(args: { bus: t.EventBus<any>; host: string }) {
  const { host } = args;
  const bus = rx.busAsType<t.BundleEvent>(args.bus);
  const events = Events({ bus });
  const { dispose, dispose$ } = events;

  // Initialise sub-controllers.
  UploadController({ bus, events, host });

  /**
   * Retrieve the status of a local bundle.
   */
  events.status.req$.subscribe(async (e) => {
    const { tx = slug(), dir } = e;
    const genesis = Genesis(host);

    const path = `${dir.replace(/\/$/, '')}/index.json`;
    const client = HttpClient.create(host).cell(e.cell ?? (await genesis.cell.uri()));
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

  return { dispose, dispose$ };
}

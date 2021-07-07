import { asArray, fs, log, ManifestSource, Schema, slug, t, time, ManifestFetch } from '../common';
import { uploadLocal } from './Controller.fs.upload.fromLocal';
import { uploadRemote } from './Controller.fs.upload.fromRemote';

export function FilesystemController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
  http: t.IHttpClient;
}) {
  const { events, http, bus } = args;

  /**
   * Upload bundles to the local server.
   */
  events.fs.save.req$.subscribe(async (e) => {
    type Res = t.BundleFsSaveRes;
    const timer = time.timer();
    const { silent, tx = slug(), target } = e;
    const host = new URL(http.origin).host;

    const done = (
      action: Res['action'],
      options: { files?: Res['files']; errors?: Res['errors'] } = {},
    ) => {
      const { files = [], errors = [] } = options;
      const cell = target.cell;
      const elapsed = timer.elapsed.msec;
      const ok = errors.length === 0;
      if (!ok) action = 'error';
      return bus.fire({
        type: 'runtime.electron/Bundle/fs/save:res',
        payload: { tx, ok, cell, files, errors, action, elapsed },
      });
    };

    const fireError = (error: string | string[]) => done('error', { errors: asArray(error) });

    const loadManifestFromFile = async (path: string) => {
      return (await fs.readJson(path)) as t.ModuleManifest;
    };

    const downloadCurrentManifest = async () => {
      const { cell, dir: path } = target;
      return ManifestFetch.get<t.ModuleManifest>({ host, cell, path });
    };

    const downloadManifestFromUrl = async (source: string) => {
      return ManifestFetch.url(source).get<t.ModuleManifest>();
    };

    try {
      if (!Schema.Uri.is.cell(target.cell)) {
        return fireError(`Invalid target cell URI ("${target.cell}")`);
      }

      const source = ManifestSource(e.source);
      const manifest =
        source.kind === 'filepath'
          ? await loadManifestFromFile(source.toString())
          : (await downloadManifestFromUrl(source.toString())).json;

      if (!manifest) return fireError(`Failed to load manifest`);

      const current = await downloadCurrentManifest();
      const hash = {
        current: current.json?.hash.files || '',
        next: manifest.hash.files,
      };

      const isChanged = current ? hash.current !== hash.next : false;

      if (!isChanged && !e.force && current) {
        const files = current.files.map(({ path, bytes }) => ({ path, bytes }));
        return done('unchanged', { files });
      }

      const uploaded =
        source.kind === 'filepath'
          ? await uploadLocal({ http, source, target, silent })
          : await uploadRemote({ http, source, target, manifest, silent });

      const { errors } = uploaded;
      const files = uploaded.files.map((file) => ({
        path: file.filename,
        bytes: file.data.byteLength,
      }));

      const action: Res['action'] = current.exists ? 'replaced' : 'created';

      return done(action, { files, errors }); // Success.
    } catch (error) {
      log.error(error.message);
      return fireError(error.message); // Failure.
    }
  });
}

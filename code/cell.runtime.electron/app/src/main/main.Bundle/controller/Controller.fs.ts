import { asArray, fs, log, ManifestSource, Schema, slug, t, time } from '../common';
import { upload } from './Controller.fs.upload';

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

    const toManifestSource = (input: string) => {
      const dir = (input || '').trim().replace(/index\.json$/, '');
      const path = fs.join(dir, 'index.json');
      return ManifestSource(path);
    };

    try {
      if (!Schema.Uri.is.cell(target.cell)) {
        return fireError(`Invalid target cell URI ("${target.cell}")`);
      }

      const source = toManifestSource(e.source);
      const manifest = (await fs.readJson(source.toString())) as t.ModuleManifest;

      const downloadManifest = async () => {
        const path = `${target.dir}/index.json`;
        const cell = http.cell(target.cell);
        const res = await cell.fs.file(path).download();

        const { ok } = res;
        const manifest = !ok ? undefined : (res.body as t.ModuleManifest);
        const exists = Boolean(manifest);
        const files = manifest?.files ?? [];

        return { exists, manifest, files, path };
      };

      const current = await downloadManifest();
      const hash = {
        current: current.manifest?.hash.files || '',
        next: manifest.hash.files,
      };

      const isChanged = current ? hash.current !== hash.next : false;

      if (!isChanged && !e.force && current) {
        const files = current.files.map(({ path, bytes }) => ({ path, bytes }));
        return done('unchanged', { files });
      }

      const uploaded = await upload({ http, source: source.toString(), target, silent });
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

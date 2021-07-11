import {
  asArray,
  fs,
  log,
  ManifestFetch,
  ManifestSource,
  rx,
  Schema,
  slug,
  t,
  time,
  toHost,
} from '../common';
import { uploadFromLocal } from './Controller.upload.fromLocal';
import { uploadFromRemote } from './Controller.upload.fromRemote';
import { Events } from '../Filesystem.Events';

type Uri = string;

export function Controller(args: {
  localhost: string;
  httpFactory: (host: string) => t.IHttpClient;
  bus: t.EventBus<any>;
}) {
  const { httpFactory } = args;
  const bus = rx.busAsType<t.FilesystemEvent>(args.bus);
  const events = Events({ bus });

  /**
   * Writes bundles to/from the local server.
   */
  events.write.req$.subscribe(async (e) => {
    type Res = t.FilesystemWriteRes;
    const timer = time.timer();
    const { silent, tx = slug() } = e;

    const host = e.target.host ? toHost(e.target.host) : toHost(args.localhost);
    const target = { ...e.target, host };

    const done = (
      action: Res['action'],
      options: { files?: Res['files']; errors?: Res['errors'] } = {},
    ) => {
      const { files = [], errors = [] } = options;
      const source = e.source;
      const ok = errors.length === 0;
      const elapsed = timer.elapsed.msec;
      if (!ok) action = 'error';
      return bus.fire({
        type: 'runtime.electron/Filesystem/write:res',
        payload: { tx, ok, action, source, target, files, errors, elapsed },
      });
    };

    const fireError = (error: string | string[]) => done('error', { errors: asArray(error) });

    type M = t.Manifest;
    const LoadManifest = {
      async fromLocalFile(path: string) {
        return (await fs.readJson(path)) as M;
      },
      async fromHost(host: string, cell: Uri, path: string) {
        return await ManifestFetch.get<M>({ host, cell, path });
      },
      async fromUrl(source: string) {
        return ManifestFetch.url(source).get<M>();
      },
    };

    try {
      if (!Schema.Uri.is.cell(e.target.cell)) {
        return fireError(`Invalid target cell URI ("${e.target.cell}")`);
      }

      const source = ManifestSource(e.source);

      const manifest =
        source.kind === 'filepath'
          ? await LoadManifest.fromLocalFile(source.toString())
          : (await LoadManifest.fromUrl(source.toString())).json;

      if (!manifest) return fireError(`Failed to load manifest`);

      const current = await LoadManifest.fromHost(host, e.target.cell, e.target.dir);
      const hash = {
        current: current.json?.hash.files || '',
        next: manifest.hash.files,
      };

      const isChanged = current ? hash.current !== hash.next : false;

      if (!isChanged && !e.force && current) {
        const files = current.files.map(({ path, bytes }) => ({ path, bytes }));
        return done('unchanged', { files });
      }

      const runUpload = async () => {
        if (source.kind === 'filepath') {
          return await uploadFromLocal({ httpFactory, source, target, silent });
        }
        if (source.kind === 'url') {
          return await uploadFromRemote({ httpFactory, source, target, manifest, silent });
        }
        throw new Error(`Source kind '${source.kind}' not supported.`);
      };

      const uploaded = await runUpload();
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

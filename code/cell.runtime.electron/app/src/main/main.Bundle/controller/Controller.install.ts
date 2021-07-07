import {
  fs,
  Genesis,
  ManifestSource,
  ManifestUrl,
  ModuleRegistry,
  slug,
  t,
  time,
  asArray,
  HttpClient,
} from '../common';

/**
 * Bundle logic for handling writes (PUT).
 */
export function InstallController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
  http: t.IHttpClient;
}) {
  const { events, http, bus } = args;

  /**
   * Install
   */
  events.install.req$.subscribe(async (e) => {
    type Res = t.BundleInstallRes;
    const timer = time.timer();
    const { tx = slug() } = e;
    const genesis = Genesis(http);
    const registry = ModuleRegistry({ http, uri: await genesis.modules.uri() });

    let module: Res['module'] | undefined;

    const done = (action: Res['action'], options: { errors?: Res['errors'] } = {}) => {
      const { errors = [] } = options;
      const source = e.source;
      const elapsed = timer.elapsed.msec;
      const ok = errors.length === 0;
      if (!ok) action = 'error';
      bus.fire({
        type: 'runtime.electron/Bundle/install:res',
        payload: { tx, ok, action, source, module, errors, elapsed },
      });
    };

    const fireError = (error: string | string[]) => done('error', { errors: asArray(error) });

    try {
      /**
       * Read in the manifest.
       */
      const fetched = await fetchManifest(e.source);
      const { source, manifest } = fetched;
      if (fetched.error) return fireError(fetched.error);
      if (!manifest) return fireError('Manifest not found');

      const domain = source.domain;
      const namespace = manifest.module.namespace;
      const version = manifest.module.version;
      const hash = manifest.hash.module;

      module = { hash, domain, namespace, version, fs: '' };

      const ns = await registry.domain(domain).namespace(namespace);
      const current = await ns.version(version);
      const unchanged = current && current.hash === hash;
      const exists = Boolean(current);

      if (unchanged && !e.force) return done('unchanged');

      /**
       * Write the registry entry.
       */
      const dbResponse = await ns.write({ source: source.toString(), manifest });
      const target = { dir: 'lib', cell: dbResponse.entry.fs };
      module.fs = target.cell;

      /**
       * Upload files.
       */
      const fsResponse = await events.fs.save.fire({
        source: source.toString(),
        target,
        silent: true,
        force: true,
      });

      if (!fsResponse.ok) {
        const err = `Failed while uploading bundle files to '${target.cell}'`;
        return fireError([err, ...fsResponse.errors].filter(Boolean));
      }

      return done(!exists ? 'created' : 'replaced'); // Success.
    } catch (error) {
      return fireError(`Failed during installation. ${error.message}`); // Failure.
    }
  });
}

/**
 * [Helpers]
 */

const fetchManifest = async (path: string) => {
  const source = ManifestSource(path);
  const error = (error?: string) => ({ source, manifest: undefined, error });
  const success = (manifest?: t.ModuleManifest) => ({
    source,
    manifest,
    error: undefined,
  });

  try {
    /**
     * File-system.
     */
    if (source.kind === 'filepath') {
      if (!(await fs.pathExists(source.path))) {
        return error(`Module manifest not found. ${source.path}`);
      }
      const manifest = (await fs.readJson(source.path)) as t.ModuleManifest;
      return success(manifest);
    }

    /**
     * URL end-point.
     */
    if (source.kind === 'url') {
      const url = ManifestUrl(source.toString());
      if (!url.ok) return error(url.error);

      const http = HttpClient.create(url.domain);
      const file = http.cell(url.cell).fs.file(url.path);
      const res = await file.download();
      if (!res.ok) return error(`Failed to download manifest. ${res.error || ''}`.trim());

      const manifest = res.body as t.ModuleManifest;
      return success(manifest);
    }
  } catch (err) {
    return error(`Failed while fetching manifest. ${err.message}`);
  }

  return error(`Manifest source kind '${source.kind}' not supported`);
};

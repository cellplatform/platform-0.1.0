import {
  asArray,
  fs,
  Genesis,
  log,
  ManifestFetch,
  ManifestSource,
  ModuleRegistry,
  slug,
  t,
  time,
  Uri,
} from '../common';

/**
 * Bundle logic for handling writes (PUT).
 */
export function InstallController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
  localhost: string;
  httpFactory: (host: string) => t.IHttpClient;
}) {
  const { bus, events, httpFactory, localhost } = args;

  /**
   * Install
   */
  events.install.req$.subscribe(async (e) => {
    type Res = t.BundleInstallRes;
    const timer = time.timer();
    const { tx = slug(), timeout } = e;
    const http = httpFactory(localhost);
    const outTx = log.gray(`(tx:${tx})`);

    if (!e.silent) {
      log.info();
      log.info.blue(`installing... ${outTx}`);
    }

    const genesis = Genesis(http);
    const registry = ModuleRegistry({ http, uri: await genesis.modules.uri() });

    let module: Res['module'] | undefined;

    const done = (action: Res['action'], options: { errors?: Res['errors'] } = {}) => {
      const { errors = [] } = options;
      const source = e.source;
      const elapsed = timer.elapsed.msec;
      const ok = errors.length === 0;
      if (!ok) action = 'error';

      const payload: t.BundleInstallRes = { tx, ok, action, source, module, errors, elapsed };

      if (!e.silent) {
        Log.installComplete(payload);
        log.info.blue(`done ${outTx}`);
      }

      http.dispose();
      bus.fire({
        type: 'runtime.electron/Bundle/install:res',
        payload,
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

      if (!e.silent) {
        const proximity =
          source.kind === 'url'
            ? `from ${log.green('"remote"')} source (url)`
            : `from ${log.green('"runtime:electron:bundle"')}`;
        log.info.gray(`   ${`${proximity}`}`);
        log.info.gray(`   ${source}`);
      }

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
        timeout,
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
      const res = await ManifestFetch.url(source.toString()).get<t.ModuleManifest>();
      const manifest = res.json;
      return res.ok && manifest ? success(manifest) : error(`Failed to download manifest.`.trim());
    }
  } catch (err) {
    return error(`Failed while fetching manifest. ${err.message}`);
  }

  return error(`Manifest source kind '${source.kind}' not supported`);
};

const Log = {
  installComplete(payload: t.BundleInstallRes) {
    const table = log.table({ border: false });
    const line = () => table.add(['', '']);
    const add = (key: string, value: any) => {
      key = log.gray(`   • ${key} `);
      table.add([key, log.green(value)]);
    };

    const { module, errors } = payload;
    const elapsed = time.duration(payload.elapsed).toString();

    errors.forEach((error, i) => {
      log.error(`ERROR (${log.white(i + 1)} of ${errors.length})`);
      log.info(error);
      log.info();
    });

    const { ok } = payload;
    add('ok', ok ? true : log.red(false));
    add('action', ok ? payload.action : log.red(payload.action));
    add('source', log.gray(payload.source));
    if (errors.length > 0) add('errors', errors.length);

    if (module) {
      line();
      table.add(['   module']);
      add('hash', log.gray(module.hash));
      add('domain', log.white(module.domain));
      add('namespace', log.white(module.namespace));
      add('version', module.version);
      add('fs', Format.cell(module.fs));
    }

    log.info(`
Installed ✨ ${log.gray(`[${log.white(elapsed)}]`)}
${table.toString()}    
`);
  },
};

const Format = {
  cell(input: string | t.ICellUri) {
    const uri = Uri.cell(input);
    return log.gray(`${log.cyan('cell:')}${uri.ns}:${log.white(uri.key)}`);
  },
};

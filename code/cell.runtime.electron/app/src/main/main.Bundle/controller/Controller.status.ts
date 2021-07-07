import { Genesis, ManifestFetch, ModuleRegistry, slug, t, Urls } from '../common';

export function StatusController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
  http: t.IHttpClient;
}) {
  const { events, http, bus } = args;

  /**
   * Retrieve the status of a local bundle.
   */
  events.status.req$.subscribe(async (e) => {
    type Res = t.BundleStatusRes;
    const { tx = slug() } = e;
    const host = new URL(http.origin).host;

    const done = (options: { status?: Res['status']; error?: Res['error'] } = {}) => {
      const { status, error } = options;
      const exists = Boolean(status);
      bus.fire({
        type: 'runtime.electron/Bundle/status:res',
        payload: { tx, exists, status, error },
      });
    };

    const fireError = (error: string) => done({ error });
    const errorContext = () => {
      const ver = e.version ? `@${e.version}` : '';
      return `${e.domain}/${e.namespace}${ver}`;
    };

    try {
      const genesis = Genesis(http);
      const registry = ModuleRegistry({ http, uri: await genesis.modules.uri() });

      const domain = registry.domain(e.domain);
      const ns = await domain.namespace(e.namespace);
      const entry = e.version ? await ns.version(e.version) : await ns.latest();
      if (!entry) return done();

      type M = t.ModuleManifest;
      const manifest = await ManifestFetch.get<M>({ host, cell: entry.fs, path: 'lib/index.json' });
      const module = manifest.json?.module;
      if (!manifest.ok || !module)
        return fireError(`Failed to load manifest for [${errorContext()}]`);

      const urls = Urls.create(host).cell(entry.fs);
      const status: t.BundleStatus = {
        latest: !Boolean(e.version),
        compiler: module.compiler,
        module: {
          hash: entry.hash,
          domain: domain.name,
          namespace: ns.name,
          version: entry.version,
          fs: entry.fs,
        },
        urls: {
          manifest: manifest.url,
          entry: urls.file.byName(`lib/${module.entry}`).toString(),
        },
      };

      done({ status }); // Success.
    } catch (error) {
      // Failure.
      return fireError(`Status request [${errorContext()}] failed. ${error.message}`);
    }
  });
}

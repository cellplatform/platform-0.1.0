import { fs, Genesis, slug, t, Urls, Uri } from '../../common';

/**
 * Bundle logic for handling writes (PUT).
 */
export function PutController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
  http: t.IHttpClient;
}) {
  const { events, http, bus } = args;

  events.put.req$.subscribe(async (e) => {
    const { tx = slug() } = e;
    const genesis = Genesis(http);

    const fireError = (error: string) => {
      bus.fire({
        type: 'runtime.electron/Bundle/put:res',
        payload: { tx, error },
      });
    };

    try {
      /**
       * Install a new bundle entry.
       */
      if (e.action === 'add') {
        // const module = e.module;
        const source = e.source;

        if (!(await fs.pathExists(source.manifest))) {
          return fireError(`Bundle manifest not found. ${source.manifest}`);
        }

        const manifest = (await fs.readJson(source.manifest)) as t.ModuleManifest;
        if (manifest.kind !== 'module') {
          return fireError(`Manifest must be of kind '${manifest.kind}'.`);
        }

        // console.log('manifest', manifest);

        const namespace = manifest.module.namespace;
        const host = 'local.package';

        // const HostRegistry = async (args: { host: string }) => {
        //   const { host } = args;
        //   const root = http.cell(await genesis.modules.uri());

        //   // const getLinks = async () => (await root.links.read()).body.cells;
        //   const getUri = async () => {
        //     const links = (await root.links.read()).body.cells;
        //     const match = links.find((link) => link.key === host);
        //     if (match) return match.value;
        //     const value = Uri.create.A1();
        //     await root.links.write({ key: host, value });
        //     return value;
        //   };

        //   // type P = { bundles: t.BundleEntries };

        //   const uri = await getUri();
        //   const hostCell = http.cell(uri);

        //   const api = {
        //     http: hostCell,
        //     host,
        //     uri,
        //     async namespace(namespace: string) {
        //       const readBundles = async () => {
        //         const props = (await hostCell.db.props.read()).body ?? {};
        //         const bundles = (props.bundles ?? {}) as t.BundleEntries;
        //         return bundles;
        //       };

        //       const api = {
        //         namespace,

        //         async read() {
        //           const bundles = await readBundles();
        //           return bundles[namespace];
        //         },

        //         async write(manifest: t.ModuleManifest) {
        //           if (manifest.module.namespace !== namespace)
        //             throw new Error(`Namespace not '${namespace}'.`);

        //           const bundles = await readBundles();
        //           const current = bundles[namespace] || { namespace, versions: [] };

        //           const index = current.versions.findIndex(
        //             ({ version }) => version === manifest.module.version,
        //           );

        //           console.log('manifest.module.version', manifest.module.version);

        //           const exists = Boolean(current.versions[index]);

        //           const version = exists
        //             ? current.versions[index]
        //             : { version: manifest.module.version };

        //           // if (index < 0) current.versions.push({ version: manifest.module.version });

        //           // const version = current.versions[index];

        //           console.log('exists', exists);
        //           console.log('index', index);
        //           console.log('current', current);
        //           console.log('version', version);

        //           //   const bundles = {
        //           //   ...current,
        //           //   // [namespace]: { versions: [] },
        //           // };

        //           // const bundle = await api.read();
        //           // console.log('bundle', bundle);

        //           bundles[namespace] = current;

        //           console.log('AFTER', bundles);

        //           // bundles[namespace] = { versions: [] };
        //           await hostCell.db.props.write({ bundles }, { onConflict: 'merge' });
        //         },
        //       };
        //       return api;
        //     },
        //   };

        //   return api;
        // };

        // const registry = await HostRegistry({ host });
        // console.log('registry', registry);

        // const ns = await registry.namespace(manifest.module.namespace);
        // console.log('-------------------------------------------');
        // console.log('ns', ns);

        // console.log('-------------------------------------------');
        // // const root = http.cell(await genesis.modules.uri());

        // const info = (await registry.http.info()).body;
        // console.log('info', info);

        // console.log('-------------------------------------------');

        // await ns.write(manifest);
        // console.log('-------------------------------------------');
        // console.log('await ns.read()', await ns.read());
      }

      /**
       * Updating an existing bundle entry.
       */
      if (e.action === 'update') {
        return fireError('Not implemented'); // TODO 🐷
      }

      bus.fire({
        type: 'runtime.electron/Bundle/put:res',
        payload: { tx },
      });
    } catch (error) {
      console.log('error', error);
      fireError(`Failed during bundle PUT operation. ${error.message}`);
    }
  });
}

import { asArray, Genesis, ModuleRegistry, slug, t } from '../common';

export function ListController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
  localhost: string;
  httpFactory: (host: string) => t.IHttpClient;
}) {
  const { events, localhost, httpFactory, bus } = args;

  /**
   * List
   */
  events.list.req$.subscribe(async (e) => {
    const { tx = slug() } = e;
    const http = httpFactory(localhost);

    const done = (args: { items?: t.BundleItem[]; error?: string } = {}) => {
      const { items = [], error } = args;
      http.dispose();
      bus.fire({
        type: 'runtime.electron/Bundle/list:res',
        payload: { tx, items, error },
      });
    };

    try {
      const genesis = Genesis(http);
      const registry = ModuleRegistry({ http, uri: await genesis.modules.uri() });

      const existingDomains = await registry.domains();
      const domains =
        e.domain === undefined
          ? existingDomains
          : asArray(e.domain)
              .map((name) => (name || '').trim())
              .filter(Boolean);

      const wait = domains
        .filter((domain) => existingDomains.includes(domain))
        .map(async (domain) => {
          const obj = registry.domain(domain);
          const namespaces = await obj.namespaces();
          const list: t.BundleItem[] = [];

          await Promise.all(
            namespaces.map(async (namespace) => {
              const versions = await (await obj.namespace(namespace)).read();
              versions.forEach((item) => {
                const { source, version, hash, fs } = item;
                list.push({ source, domain, namespace, version, hash, fs });
              });
            }),
          );

          return list;
        });

      const list = await Promise.all(wait);
      const items = list.reduce((acc, next) => [...acc, ...next], []);

      return done({ items }); // Success.
    } catch (err) {
      const error = `Failed while retrieving list. ${err.message}`;
      return done({ error }); // Failure.
    }
  });
}

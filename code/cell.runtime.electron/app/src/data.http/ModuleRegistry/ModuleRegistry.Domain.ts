import { asArray, Clean, Encoding, t, Uri } from './common';
import { ModuleRegistryNamespace } from './ModuleRegistry.Namespace';

/**
 * Handles a [ModuleRegistry] for a source domain
 * (eg. "hostname" where the module source was retrieved).
 */
export function ModuleRegistryDomain(args: {
  http: t.IHttpClient;
  domain: string;
  parent: t.ICellUri | string; // Parent cell containing the link-index to hosts.
}) {
  const { http } = args;
  const domain = Clean.domain(args.domain, { throw: true });
  const domainLinkKey = Encoding.domainKey.escape(domain);

  const getOrCreateLink = async (
    subject: t.ICellUri | string,
    key: string,
    onCreate?: (key: string, uri: string) => Promise<any>,
  ) => {
    const cell = http.cell(subject);
    const links = (await cell.links.read()).body;
    const match = links.cells.find((link) => link.key === key);
    if (match) return match.value;

    const value = Uri.create.A1();
    await cell.links.write({ key, value });

    if (onCreate) await onCreate(key, value);
    return value;
  };

  let _uri: t.ICellUri | undefined;

  const api = {
    domain,

    /**
     * The URI of the cell containing the modules of the "domain".
     */
    async uri() {
      if (!_uri) {
        const uri = await getOrCreateLink(args.parent, domainLinkKey, async (key, uri) => {
          await http.cell(uri).db.props.write<t.RegistryCellPropsDomain>({
            title: 'Module Registry (Domain)',
            domain,
          });
        });
        _uri = Uri.cell(uri);
      }
      return _uri;
    },

    /**
     * Retrieve a list of all [namespaces] within the domain.
     */
    async namespaces() {
      const cell = http.cell(await api.uri());
      const links = (await cell.links.read()).body;
      return links.cells
        .map((link) => link.key)
        .filter(Encoding.namespaceKey.is)
        .map(Encoding.namespaceKey.unescape);
    },

    /**
     * Retrieve the API for working with a module "namespace".
     */
    async namespace(namespace: string) {
      namespace = Clean.namespace(namespace, { throw: true });
      const linkKey = Encoding.namespaceKey.escape(namespace);
      const uri = await getOrCreateLink(await api.uri(), linkKey, async (key, uri) => {
        await http.cell(uri).db.props.write<t.RegistryCellPropsNamespace>({
          kind: 'registry:namespace',
          title: 'Module Registry (Namespace)',
          namespace,
          versions: [],
        });
      });
      return ModuleRegistryNamespace({ http, namespace, domain, uri });
    },

    /**
     * Delete a namespace or the entire domain.
     *  - delete all namespace version bundles (fs).
     *  - delete namespace props (db)
     *  - delete link reference
     */
    async delete(namespace?: string | string[]) {
      const namespaces =
        namespace === undefined
          ? await api.namespaces()
          : asArray(namespace)
              .map((ns) => (ns || '').trim())
              .filter(Boolean);

      const httpDomain = http.cell(await api.uri());
      const encoding = Encoding.namespaceKey;
      const links = (await httpDomain.links.read()).body.cells
        .filter((link) => encoding.is(link.key))
        .filter((link) => namespaces.includes(encoding.unescape(link.key)));

      const deleteNamespace = async (namespace: string) => {
        await (await api.namespace(namespace)).delete();
        const link = links.find((item) => encoding.unescape(item.key) === namespace);
        await link?.http.db.props.write({}, { onConflict: 'overwrite' });
      };

      await Promise.all(namespaces.map(deleteNamespace));
      await httpDomain.links.delete(links.map(({ key }) => key));

      if (namespace === undefined) {
        await httpDomain.db.props.write({}, { onConflict: 'overwrite' });
      }
    },

    /**
     * Convert to string.
     */
    toString: () => `[ModuleRegistryDomain:${domain}]`,
  };

  return api;
}

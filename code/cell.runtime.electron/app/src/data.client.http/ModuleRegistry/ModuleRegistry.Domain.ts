import { d, t, Uri } from './common';
import { ModuleRegistryNamespace } from './ModuleRegistry.Namespace';
import { Clean, Encoding } from './util';

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

  const api = {
    domain,

    /**
     * The URI of the cell containing the modules of the "domain".
     */
    async uri() {
      const uri = await getOrCreateLink(args.parent, domainLinkKey, async (key, uri) => {
        await http.cell(uri).db.props.write<d.RegistryCellPropsDomain>({
          title: 'Module Registry (Domain)',
          domain,
        });
      });
      return Uri.cell(uri);
    },

    /**
     * Retrieve a list of all [namespaces] within the domain.
     */
    async namespaces() {
      const uri = await api.uri();
      const cell = http.cell(uri);
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
        await http.cell(uri).db.props.write<d.RegistryCellPropsNamespace>({
          kind: 'registry:namespace',
          title: 'Module Registry (Namespace)',
          namespace,
          versions: [],
        });
      });
      return ModuleRegistryNamespace({ http, namespace, domain, uri });
    },

    /**
     * Convert to string.
     */
    toString: () => `[ModuleRegistryDomain:${domain}]`,
  };

  return api;
}

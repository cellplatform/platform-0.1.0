import { t, Uri } from './common';
import { ModuleRegistryNamespace } from './ModuleRegistry.Namespace';
import { Clean } from './util';
import { DomainCellProps } from './types';

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
  const parent = http.cell(args.parent);
  const domain = Clean.domain(args.domain, { throw: true });
  const key = domain.replace(/\:/g, '.'); // NB: avoid invalid key with ":" character (eg. "domain:port").

  const api = {
    domain,

    /**
     * The URI of the cell containing the modules of the "host".
     */
    async uri() {
      const links = (await parent.links.read()).body;
      const match = links.cells.find((link) => link.key === key);
      if (match) return Uri.cell(match.value, true);

      const value = Uri.create.A1();
      await parent.links.write({ key, value });

      const cell = http.cell(value);
      await cell.db.props.write<DomainCellProps>({
        title: 'Module Registry (Domain)',
        domain,
      });

      return cell.uri;
    },

    /**
     * Retrieve the API for working with a module "namespace".
     */
    async namespace(namespace: string) {
      const uri = (await api.uri()).toString();
      return ModuleRegistryNamespace({
        http,
        namespace,
        domain: { name: domain, uri },
      });
    },
  };

  return api;
}

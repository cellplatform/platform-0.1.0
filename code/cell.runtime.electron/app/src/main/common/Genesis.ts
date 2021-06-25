import { ConfigFile } from './ConfigFile';
import { Schema, Uri, HttpClient } from './libs';

/**
 * Helpers for working with the Genesis cell.
 */

export function Genesis(host: string) {
  const api = {
    cell: {
      /**
       * The URI of the genesis cell.
       */
      async uri() {
        const config = await ConfigFile.read();
        const A1 = Uri.create.cell(config.refs.genesis, 'A1');
        return Uri.cell(A1);
      },

      async url() {
        const uri = await api.cell.uri();
        return Schema.Urls.create(host).cell(uri).info;
      },
    },

    modules: {
      linkKey: 'sys.modules',

      /**
       * The cell that contains the registry of installed modules.
       */
      async uri(args: { host: string }) {
        const key = api.modules.linkKey;

        const client = HttpClient.create(args.host);
        const cell = client.cell(await api.cell.uri());

        // Write regsitry reference if it does not already exist.
        const exists = await cell.links.exists(key);
        if (!exists) {
          await cell.links.write({ key, value: Schema.Uri.create.A1() });
        }

        // Filter on the registry-cell link.
        const links = await cell.links.read();
        const registryLink = links.body.cells.find((item) => item.key === key);
        if (!registryLink) {
          const err = `A '${key}' link could not be found on genesis [${cell.uri.toString()}]`;
          throw new Error(err);
        }

        // Finish up.
        return Uri.cell(registryLink.value);
      },
    },
  };

  return api;
}

import { ConfigFile } from './ConfigFile';
import { Schema, Uri } from './libs';
import * as t from './types';

export type GenesisProps = { title: string };

/**
 * Helpers for working with the "Genesis" cell.
 */
export function Genesis(http: t.IHttpClient) {
  const urls = Schema.Urls.create(http.origin);
  let genesisUri: string | undefined;

  const api = {
    cell: {
      /**
       * The URI of the genesis cell.
       */
      async uri() {
        if (!genesisUri) genesisUri = (await ConfigFile.read()).refs.genesis;
        const A1 = Uri.create.cell(genesisUri, 'A1');
        return Uri.cell(A1);
      },

      /**
       * Formats a URL to the genesis cell.
       */
      async url() {
        const uri = await api.cell.uri();
        return urls.cell(uri).info.toString();
      },

      /**
       * Ensure the genesis cell exists.
       */
      async ensureExists() {
        const cell = http.cell(await api.cell.uri());
        const exists = await cell.exists();
        if (exists) return { created: false };
        await cell.db.props.write<GenesisProps>({ title: 'Genesis Cell' });
        return { created: true };
      },
    },

    modules: {
      /**
       * The cell that contains the registry of installed modules.
       */
      async uri() {
        const key = 'sys.modules';
        const cell = http.cell(await api.cell.uri());

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

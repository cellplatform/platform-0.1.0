import { Schema, Uri, t } from '../common';

export type CellInfo = { title: string; type: string };

/**
 * Helpers for working with the "Genesis" cell.
 */
export function Genesis(http: t.IHttpClient, getUri: () => Promise<string>) {
  const urls = Schema.Urls.create(http.origin);
  let _uri: string | undefined;

  const api = {
    cell: {
      /**
       * The URI of the genesis cell.
       */
      async uri() {
        if (!_uri) _uri = await getUri();
        return Uri.cell(_uri);
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
        const info = await cell.db.props.read<CellInfo>();
        const exists = Boolean(info.body);
        if (exists) return { created: false };

        await cell.db.props.write<CellInfo>({ title: 'Genesis', type: 'sys.data.Genesis' });
        return { created: true };
      },
    },

    modules: {
      /**
       * The cell that contains the "Module Registry" of installed code bundles.
       */
      async uri() {
        const key = 'sys.modules';
        const genesis = http.cell(await api.cell.uri());

        // Write registry reference if it does not already exist.
        const exists = await genesis.links.exists(key);
        if (!exists) {
          const A1 = Schema.Uri.create.A1();
          await genesis.links.write({ key, value: A1 });
          await http.cell(A1).db.props.write<CellInfo>({
            title: 'Module Registry',
            type: 'sys.data.ModuleRegistry',
          });
        }

        // Filter on the registry-cell link.
        const links = await genesis.links.read();
        const registryLink = links.body.cells.find((item) => item.key === key);
        if (!registryLink) {
          const err = `A '${key}' link could not be found on genesis [${genesis.uri.toString()}]`;
          throw new Error(err);
        }

        // Finish up.
        return Uri.cell(registryLink.value);
      },

      /**
       * Formats a URL to the "Module Registry".
       */
      async url() {
        const uri = await api.modules.uri();
        return urls.cell(uri).info.toString();
      },
    },
  };

  return api;
}

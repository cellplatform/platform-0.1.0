import { t, util, Uri } from '../common';
import { HttpClientNs } from './HttpClientNs';

type O = Record<string, unknown>;

/**
 * HTTP client for operating on a set of [Cell] files.
 */
export function HttpClientCellDb(args: {
  parent: t.IHttpClientCell;
  urls: t.IUrls;
  http: t.IHttp;
}): t.IHttpClientCellDb {
  const { parent, urls, http } = args;
  const uri = parent.uri;

  const api: t.IHttpClientCellDb = {
    uri,
    toString: () => uri.toString(),

    /**
     * Determine if the cell already exists.
     */
    async exists() {
      const res = await http.get(urls.cell(uri).info.toString());
      return res.status.toString().startsWith('2');
    },

    /**
     * Read data from the cell.
     */
    async read(options: t.IReqQueryCellInfo = {}) {
      const url = urls.cell(uri).info.query(options).toString();
      const res = await http.get(url);
      return util.fromHttpResponse(res).toClientResponse<t.IResGetCell>();
    },

    /**
     * Write data to the cell.
     */
    async write<T extends t.ICellProps = t.ICellProps>(
      data: t.ICellData<T>,
      options?: t.IReqQueryNsWrite,
    ) {
      const ns = HttpClientNs({ uri: Uri.ns(uri.ns), urls, http });
      return ns.write({ cells: { [uri.key]: data } }, options);
    },

    props: {
      /**
       * Read property data from the cell.
       */
      async read<P extends O = O>(options?: t.IReqQueryCellInfo) {
        const res = await api.read(options);
        const props = res.body?.data?.props as P | undefined;
        return util.toClientResponse<P | undefined>(res.status, props);
      },

      /**
       * Write property data to the cell.
       */
      async write<P extends O = O>(props: P, options?: t.IReqQueryNsWrite) {
        return api.write({ props }, options);
      },
    },
  };

  return api;
}

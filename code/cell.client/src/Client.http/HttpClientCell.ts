import { t, util } from '../common';
import { HttpClientCellFs } from './HttpClientCellFs';
import { HttpClientCellLinks } from './HttpClientCellLinks';

/**
 * An HTTP client for operating on a Cell.
 */
export function HttpClientCell(args: {
  uri: t.ICellUri;
  urls: t.IUrls;
  http: t.IHttp;
}): t.IHttpClientCell {
  const { uri, urls, http } = args;

  let fs: t.IHttpClientCellFs | undefined;
  let links: t.IHttpClientCellLinks | undefined;

  const api: t.IHttpClientCell = {
    uri,

    get url() {
      return urls.cell(uri);
    },

    get fs(): t.IHttpClientCellFs {
      if (fs) return fs;
      return (fs = HttpClientCellFs({ parent, urls, http }));
    },

    get links(): t.IHttpClientCellLinks {
      if (links) return links;
      return (links = HttpClientCellLinks({ uri, urls, http, getInfo: () => this.info() }));
    },

    async exists() {
      const res = await http.get(api.url.info.toString());
      return res.status.toString().startsWith('2');
    },

    async info(options: t.IReqQueryCellInfo = {}) {
      const url = api.url.info.query(options).toString();
      const res = await http.get(url);
      return util.fromHttpResponse(res).toClientResponse<t.IResGetCell>();
    },

    toString: () => uri.toString(),
  };

  const parent = api;
  return api;
}

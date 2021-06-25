import { Schema, t, util } from '../common';

// type GetError = (args: { status: number }) => string;

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

    get url() {
      return urls.cell(uri);
    },

    toString: () => uri.toString(),

    async exists() {
      const res = await http.get(api.url.info.toString());
      return res.status.toString().startsWith('2');
    },

    async read(options: t.IReqQueryCellInfo = {}) {
      const url = api.url.info.query(options).toString();
      const res = await http.get(url);
      return util.fromHttpResponse(res).toClientResponse<t.IResGetCell>();
    },
  };

  return api;
}

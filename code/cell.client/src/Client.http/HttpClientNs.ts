import { t, util } from '../common';

export type IClientNsArgs = { uri: t.INsUri; urls: t.IUrls; http: t.IHttp };

/**
 * HTTP client for operating on a [Namespace].
 */

export function HttpClientNs(args: {
  uri: t.INsUri;
  urls: t.IUrls;
  http: t.IHttp;
}): t.IHttpClientNs {
  const { uri, urls, http } = args;

  const api: t.IHttpClientNs = {
    uri,

    get url() {
      return urls.ns(uri);
    },

    async exists() {
      const res = await http.get(api.url.info.toString());
      return res.status.toString().startsWith('2');
    },

    async read(options: t.IReqQueryNsInfo = {}) {
      const url = api.url.info.query(options).toString();
      const res = await http.get(url);
      return util.fromHttpResponse(res).toClientResponse<t.IResGetNs>();
    },

    async write(data: t.IReqPostNsBody, options: t.IReqQueryNsWrite = {}) {
      const url = api.url.info.query(options).toString();
      const res = await http.post(url, data);
      return util.fromHttpResponse(res).toClientResponse<t.IResPostNs>();
    },
  };

  return api;
}

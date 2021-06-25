import { t, util } from '../common';

/**
 * HTTP client for operating on files.
 */
export function HttpClientFile(args: {
  uri: t.IFileUri;
  urls: t.IUrls;
  http: t.IHttp;
}): t.IHttpClientFile {
  const { uri, urls, http } = args;

  const api: t.IHttpClientFile = {
    uri,

    get url() {
      return urls.file(uri);
    },

    async info() {
      const res = await http.get(api.url.toString());
      return util.fromHttpResponse(res).toClientResponse<t.IResGetFile>();
    },

    toString: () => uri.toString(),
  };

  return api;
}

import { t, util } from '../common';
import { HttpClientCellLinksInfo } from './HttpClientCellLinks';

export * from './HttpClientCellLinks.info';

export function HttpClientCellLinks(args: {
  uri: t.ICellUri;
  urls: t.IUrls;
  http: t.IHttp;
  getInfo: () => Promise<t.IHttpClientResponse<t.IResGetCell>>;
}): t.IHttpClientCellLinks {
  const { uri, urls, http } = args;

  const api: t.IHttpClientCellLinks = {
    /**
     * Retrieve information about the cell's links.
     */
    async info() {
      type T = t.IHttpClientCellLinksInfo;

      const info = await args.getInfo();
      if (info.error) {
        const message = `Failed to get links for '${uri.toString()}'. ${info.error.message}`;
        return util.toError<T>(info.status, info.error.type, message);
      }

      const cell = info.body.data;
      const links = cell.links || {};
      const body = HttpClientCellLinksInfo({ links, urls, http });

      return util.toClientResponse<T>(200, body);
    },
  };

  return api;
}

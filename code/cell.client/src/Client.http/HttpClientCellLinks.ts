import { t, util, Schema, Uri } from '../common';
import { HttpClientCellLinksInfo } from './HttpClientCellLinks';
import { HttpClientNs } from './HttpClientNs';

export * from './HttpClientCellLinks.info';

export function HttpClientCellLinks(args: {
  uri: t.ICellUri;
  urls: t.IUrls;
  http: t.IHttp;
  getInfo: () => Promise<t.IHttpClientResponse<t.IResGetCell>>;
}): t.IHttpClientCellLinks {
  const { uri, urls, http } = args;
  const RefLinks = Schema.Ref.Links;

  const api: t.IHttpClientCellLinks = {
    get uri() {
      return uri.toString();
    },

    /**
     * Retrieve information about the cell's links.
     */
    async read() {
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

    /**
     * Write link(s) to the cell.
     */
    async write(
      link: t.HttpClientCellLinksSet | t.HttpClientCellLinksSet[],
      options?: t.IReqQueryNsWrite,
    ) {
      const list = Array.isArray(link) ? link : [link];
      const links = list
        .map((link) => ({ ...link, key: RefLinks.toKey(link.key) }))
        .reduce((acc, next) => {
          acc[next.key] = (next.value || '').trim();
          return acc;
        }, {});
      const ns = HttpClientNs({ uri: Uri.ns(uri.ns), urls, http });
      return ns.write({ cells: { [uri.key]: { links } } }, options);
    },

    /**
     * Removes link(s) from the cell.
     */
    async delete(key: string | string[], options?: t.IReqQueryNsWrite) {
      const keys = Array.isArray(key) ? key : [key];
      const links = keys.map((key) => ({ key, value: '' })); // NB: Empty values are removed.
      return api.write(links, options);
    },

    /**
     * Determine if the given key(s) exist on the cell.
     */
    async exists(key: string | string[]) {
      const wanted = Array.isArray(key) ? key : [key];
      const links = (await api.read()).body;
      const linked = links.list.map((link) => Schema.Ref.Links.parseKey(link.key).path);
      const exists = linked.some((linkedKey) => wanted.includes(linkedKey));
      return exists;
    },
  };

  return api;
}

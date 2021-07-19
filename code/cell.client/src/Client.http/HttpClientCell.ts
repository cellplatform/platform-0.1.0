import { t } from '../common';
import { HttpClientCellDb } from './HttpClientCellDb';
import { HttpClientCellFs } from './HttpClientCellFs';
import { HttpClientCellLinks } from './HttpClientCellLinks';

/**
 * An HTTP client for operating on a Cell.
 */
export function HttpClientCell(args: {
  uri: t.ICellUri;
  urls: t.IUrls;
  http: t.Http;
}): t.IHttpClientCell {
  const { uri, urls, http } = args;

  let fs: t.IHttpClientCellFs | undefined;
  let db: t.IHttpClientCellDb | undefined;
  let links: t.IHttpClientCellLinks | undefined;

  const api: t.IHttpClientCell = {
    uri,

    get url() {
      return urls.cell(uri);
    },

    get db(): t.IHttpClientCellDb {
      if (db) return db;
      return (db = HttpClientCellDb({ parent, urls, http }));
    },

    get fs(): t.IHttpClientCellFs {
      if (fs) return fs;
      return (fs = HttpClientCellFs({ parent, urls, http }));
    },

    get links(): t.IHttpClientCellLinks {
      if (links) return links;
      return (links = HttpClientCellLinks({ uri, urls, http, getInfo: () => this.info() }));
    },

    exists() {
      return api.db.exists();
    },

    info(options: t.IReqQueryCellInfo = {}) {
      return api.db.read(options);
    },

    toString: () => uri.toString(),
  };

  const parent = api;
  return api;
}

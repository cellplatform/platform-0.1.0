import { Schema, t, Uri } from '../common';
import { HttpClientFile } from './HttpClientFile';
import { HttpClientCell } from './HttpClientCell';
import { HttpClientNs } from './HttpClientNs';

type L = t.IHttpClientCellLink;

/**
 * HTTP client for operating on a cell's links.
 */
export function HttpClientCellLinksInfo(args: {
  links: t.ICellData['links'];
  urls: t.IUrls;
  http: t.IHttp;
}): t.IHttpClientCellLinksInfo {
  const { urls, http, links = {} } = args;
  const list = Object.keys(links).map((key) => toLink({ urls, http, key, value: links[key] }));
  const filter = <T extends L>(type: T['type']) => list.filter((item) => item.type === type) as T[];

  const api: t.IHttpClientCellLinksInfo = {
    toObject: () => args.links,
    get list() {
      return list;
    },
    get files() {
      return filter<t.IHttpClientCellLinkFile>('FILE');
    },
    get cells() {
      return filter<t.IHttpClientCellLinkCell>('CELL');
    },
    get namespaces() {
      return filter<t.IHttpClientCellLinkNs>('NS');
    },
  };

  return api;
}

/**
 * [Helpers]
 */

function toLink(args: {
  urls: t.IUrls;
  http: t.IHttp;
  key: string;
  value: string;
}): t.IHttpClientCellLink {
  const { http, urls, key, value } = args;
  const uri = Uri.parse(value);
  const type = uri.parts.type;

  if (type === 'FILE') {
    let client: t.IHttpClientFile | undefined;
    const link = Schema.File.Links.parseValue(value);
    const uri = link.uri;
    const hash = link.query.hash || '';
    const { name, dir, path } = Schema.File.Links.parseKey(key);
    const res: t.IHttpClientCellLinkFile = {
      type: 'FILE',
      value,
      uri,
      key,
      path,
      dir,
      name,
      hash,
      get http() {
        return client || (client = HttpClientFile({ uri, urls, http }));
      },
    };
    return res;
  }

  if (type === 'CELL') {
    let client: t.IHttpClientCell | undefined;
    const uri = Uri.cell(value);
    const res: t.IHttpClientCellLinkCell = {
      type: 'CELL',
      key,
      value,
      uri,
      get http() {
        return client || (client = HttpClientCell({ uri, urls, http }));
      },
    };
    return res;
  }

  if (type === 'NS') {
    let client: t.IHttpClientNs | undefined;
    const uri = Uri.ns(value);
    const res: t.IHttpClientCellLinkNs = {
      type: 'NS',
      key,
      value,
      uri,
      get http() {
        return client || (client = HttpClientNs({ uri, urls, http }));
      },
    };
    return res;
  }

  // Unknown type.
  const res: t.IHttpClientCellLinkUnknown = { type: 'UNKNOWN', key, value };
  return res;
}

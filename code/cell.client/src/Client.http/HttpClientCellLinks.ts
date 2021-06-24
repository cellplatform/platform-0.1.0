import { Schema, t, Uri } from '../common';
import { HttpClientFile } from './HttpClientFile';
import { HttpClientCell } from './HttpClientCell';
import { HttpClientNs } from './HttpClientNs';

type LinkArgs = {
  links: t.ICellData['links'];
  urls: t.IUrls;
  http: t.IHttp;
};

/**
 * HTTP client for operating on a [Cell]'s links.
 */
export class HttpClientCellLinks implements t.IHttpClientCellLinks {
  public static create(args: LinkArgs): t.IHttpClientCellLinks {
    return new HttpClientCellLinks(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: LinkArgs) {
    const { urls, http, links = {} } = args;
    this.args = args;
    this.list = Object.keys(links).map((key) => toLink({ urls, http, key, value: links[key] }));
  }

  /**
   * [Fields]
   */
  private readonly args: LinkArgs;
  public readonly list: t.IHttpClientCellLink[];

  /**
   * [Properties]
   */
  public get files() {
    return this.list.filter(({ type }) => type === 'FILE') as t.IHttpClientCellLinkFile[];
  }

  public get cells() {
    return this.list.filter(({ type }) => type === 'CELL') as t.IHttpClientCellLinkCell[];
  }

  public get namespaces() {
    return this.list.filter(({ type }) => type === 'NS') as t.IHttpClientCellLinkNs[];
  }

  /**
   * [Methods]
   */
  public toObject() {
    return this.args.links;
  }

  /**
   * Helpers
   */
  private toLink__(key: string, value: string) {
    // const { http, urls } = this.args;
    // const uri = Uri.parse(value);
    // const type = uri.parts.type;
    // if (type === 'FILE') {
    //   let client: t.IHttpClientFile | undefined;
    //   const link = Schema.File.Links.parseValue(value);
    //   const uri = link.uri;
    //   const hash = link.query.hash || '';
    //   const { name, dir, path } = Schema.File.Links.parseKey(key);
    //   const res: t.IHttpClientCellLinkFile = {
    //     type: 'FILE',
    //     value,
    //     uri,
    //     key,
    //     path,
    //     dir,
    //     name,
    //     hash,
    //     get http() {
    //       return client || (client = HttpClientFile.create({ uri, urls, http }));
    //     },
    //   };
    //   return res;
    // }
    // if (type === 'CELL') {
    //   let client: t.IHttpClientCell | undefined;
    //   const uri = Uri.cell(value);
    //   const res: t.IHttpClientCellLinkCell = {
    //     type: 'CELL',
    //     key,
    //     value,
    //     uri,
    //     get http() {
    //       return client || (client = HttpClientCell.create({ uri, urls, http }));
    //     },
    //   };
    //   return res;
    // }
    // if (type === 'NS') {
    //   let client: t.IHttpClientNs | undefined;
    //   const uri = Uri.ns(value);
    //   const res: t.IHttpClientCellLinkNs = {
    //     type: 'NS',
    //     key,
    //     value,
    //     uri,
    //     get http() {
    //       return client || (client = HttpClientNs.create({ uri, urls, http }));
    //     },
    //   };
    //   return res;
    // }
    // // Unknown type.
    // const res: t.IHttpClientCellLinkUnknown = { type: 'UNKNOWN', key, value };
    // return res;
  }
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
        return client || (client = HttpClientFile.create({ uri, urls, http }));
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
        return client || (client = HttpClientCell.create({ uri, urls, http }));
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
        return client || (client = HttpClientNs.create({ uri, urls, http }));
      },
    };
    return res;
  }

  // Unknown type.
  const res: t.IHttpClientCellLinkUnknown = { type: 'UNKNOWN', key, value };
  return res;
}

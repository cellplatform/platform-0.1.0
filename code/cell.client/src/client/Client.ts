import { t, http, Schema, Urls, Uri } from '../common';

type F = t.IFetchOptions;

/**
 * Initializes a CellOS http client.
 */
// export function init(host: string | number) {
//   // Prepare base URL.
//   // const protocol = args.host === 'localhost' ? 'http' : 'https';
//   // const host = `${args.host}:${args.port}`;
//   // const origin = `${protocol}://${host}`;
//   // const url = (path: string) => `${origin}/${(path || '').replace(/^\/*/, '')}`;

//   const url = Schema.url(host);

//   // HTTP client.
//   const client = {
//     origin: url.origin,
//     uri: Schema.uri,
//     url,
//     // url,
//     // get: async (path: string, options: F = {}) => http.get(url(path), options),
//     // post: async (path: string, data?: any, options: F = {}) => http.post(url(path), data, options),
//   };

//   // Finish up.
//   return client;
// }

/**
 * An HTTP client for the CellOS.
 */
export class Client {
  public static create(host: string | number) {
    return new Client({ host });
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: { host: string | number }) {
    this.url = Schema.url(args.host);
    this.origin = this.url.origin;
  }

  /**
   * [Fields]
   */
  public readonly origin: string;
  public readonly url: Urls;
  public readonly uri = Schema.uri;

  /**
   * [Properties]
   */
}

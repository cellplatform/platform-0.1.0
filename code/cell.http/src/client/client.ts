import { t, http, cell } from './common';

const { Uri } = cell;

/**
 * Initializes a CellOS http client.
 */
export function init(args: { host: string; port: number }) {
  // Prepare base URL.
  const protocol = args.host === 'localhost' ? 'http' : 'https';
  const host = `${args.host}:${args.port}`;
  const origin = `${protocol}://${host}`;

  // Namespace methods.
  const ns = {
    postData(uri: string, body: t.IReqPostNsBody) {
      const url = `${origin}/${uri}/data`;
      return http.post(url, body);
    },
  };

  // Finish up.
  return { ns, Uri };
}

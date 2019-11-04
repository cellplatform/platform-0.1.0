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
    async postData(uri: string, body: t.IReqNsData) {
      const url = `${origin}/${uri}/data`;

      console.log('POST url', url);

      const res = await http.post(url, body);

      console.log('res', res);

      return res;
    },
  };

  // Finish up.
  return { ns, Uri };
}

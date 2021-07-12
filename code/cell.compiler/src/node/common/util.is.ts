import { isModel } from './util.model';

/**
 * Flag tests.
 */
export const is = {
  model: (input: any) => isModel(input),
};

export function parseUrl(input: string) {
  input = (input || '').trim();

  const hasProtocol = input.startsWith('http:') || input.startsWith('https:');
  if (!hasProtocol) {
    input = input.startsWith('localhost') ? `http://${input}` : `https://${input}`;
  }

  const parsed = new URL(input);
  const protocol = parsed.protocol || '';
  const hostname = parsed.hostname || '';
  const path = parsed.pathname ? parsed.pathname.replace(/^\/*/, '') : '';
  const port = parsed.port ? parseInt(parsed.port, 10) : undefined;

  let url = `${protocol}//${hostname}`;
  url = port && port !== 80 ? `${url}:${port}` : url;
  url = path ? `${url}/${path}` : url;
  url = `${url.replace(/\/*$/, '')}/`;

  return {
    url,
    port,
    protocol,
    host: parsed.host || '',
    hostname,
    path,
    toString: () => url,
  };
}

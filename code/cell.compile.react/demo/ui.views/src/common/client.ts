import { Client } from './libs';
import { queryString } from '@platform/util.string';

export function parseClient(href: string) {
  const query = queryString.toObject<{ def: string }>(href);
  const parts = (query.def || '').split('ns:');

  const host = (parts[0] || location.host).replace(/\:$/, '');
  const ns = parts[1] || '';

  const def = `ns:${ns}`;
  const client = Client.create(host);

  const res = { host, def, client };
  return res;
}

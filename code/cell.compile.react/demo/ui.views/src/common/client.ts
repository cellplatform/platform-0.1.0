import { Client } from './libs';
import { queryString } from '@platform/util.string';

export function parseClient(href: string) {
  const query = queryString.toObject<{ def: string }>(href);
  const [host, ns] = (query.def || '').split(':ns:');
  const def = `ns:${ns}`;
  const client = Client.create(host);
  return { host, def, client };
}

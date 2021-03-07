import { queryString } from './libs';

export function getQuery() {
  const query = queryString.toObject(location.href);

  const connectTo = (query.connectTo?.toString() || '')
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
    .sort();

  return { query, connectTo };
}

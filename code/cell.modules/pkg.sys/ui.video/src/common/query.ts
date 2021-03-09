import { queryString } from './libs';

export const QueryString = {
  parse(href?: string) {
    href = href || location.href;
    const query = queryString.toObject(location.href);
    const connectTo = (query.connectTo?.toString() || '')
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean)
      .sort();

    return {
      href,
      query,
      connectTo,
    };
  },

  generate(args: { peers: string[] }) {
    const peers = args.peers.map((id) => (id || '').trim());
    return `?connectTo=${peers.join(',')}`;
  },
};

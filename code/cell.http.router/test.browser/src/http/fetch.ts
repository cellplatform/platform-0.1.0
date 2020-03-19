import { t, Http } from '../common';

export const fetch: t.HttpFetch = async req => {
  const tmp = { msg: 'hello' };

  return {
    status: 202,
    headers: Http.toRawHeaders({ 'Content-Type': 'application/json' }),
    body: null,
    text: async () => JSON.stringify(tmp),
    json: async () => tmp,
  };
};

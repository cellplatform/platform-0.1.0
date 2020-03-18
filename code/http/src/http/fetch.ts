import * as isomorphicFetch from 'isomorphic-fetch';
import { t, util } from '../common';

export const fetch: t.HttpFetch = async req => {
  const { url, method, mode, data } = req;

  const body: any = util.isFormData(req.headers)
    ? data
    : util.stringify(
        data,
        () => `Failed to ${method} to '${url}'. The data could not be serialized to JSON.`,
      );

  const headers = util.toRawHeaders(req.headers);
  return isomorphicFetch(url, { method, mode, body, headers });
};

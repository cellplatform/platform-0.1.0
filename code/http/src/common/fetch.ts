import * as isomorphicFetch from 'isomorphic-fetch';

import { Mime } from './libs';
import * as t from './types';
import * as util from './util';

export const fetch: t.HttpFetch = async req => {
  const { url, method, mode, data, headers } = req;

  const body: any = util.isFormData(headers)
    ? data
    : util.stringify(
        data,
        () => `Failed to ${method} to '${url}'. The data could not be serialized to JSON.`,
      );

  const fetched = await isomorphicFetch(url, {
    method,
    mode,
    body,
    headers: util.toRawHeaders(headers),
  });

  const contentType = fetched.headers.get('content-type') || '';
  const isBinary = Mime.isBinary(contentType);

  // fetched.json()

  const { status, statusText } = fetched;
  const res: t.IHttpRespondPayload = {
    status,
    statusText,
    headers: util.fromRawHeaders(fetched.headers),
    data: isBinary ? fetched.body || undefined : await fetched.text(),
  };

  return res;
};

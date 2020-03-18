import { id, t, time, util, value } from '../common';

export const fetcher = async (args: {
  url: string;
  method: t.HttpMethod;
  fire: t.FireEvent;
  mode: t.HttpCors;
  headers: t.IHttpHeaders;
  fetch: t.HttpFetch;
  data?: any;
}) => {
  // Prepare arguments.
  const timer = time.timer();
  const uid = `req:${id.shortid()}`;
  const { url, method, data, fire, mode, headers } = args;

  type M = { headers?: t.IHttpHeaders; data?: any; respond?: t.HttpRespondInput };
  const modifications: M = {
    headers: args.headers || {},
    data: undefined,
    respond: undefined,
  };

  const modify: t.IHttpModify = {
    header(key: string, value: string) {
      before.isModified = true;
      const headers = modifications.headers || {};
      if (value) {
        headers[key] = value;
      } else {
        delete headers[key];
      }
      modifications.headers = headers;
    },
    headers: {
      merge(input: t.IHttpHeaders) {
        before.isModified = true;
        modifications.headers = value.deleteEmpty({ ...modifications.headers, ...input });
      },
      replace(input: t.IHttpHeaders) {
        before.isModified = true;
        modifications.headers = value.deleteEmpty(input);
      },
    },
  };

  // Fire BEFORE event.
  const before: t.IHttpBefore = {
    uid,
    method,
    url,
    data,
    headers,
    isModified: false,
    modify,
    respond(input) {
      modifications.respond = input;
    },
  };
  fire({ type: 'HTTP/before', payload: before });

  if (modifications.respond) {
    // Exit with faked/overridden response if one was returned via the BEFORE event.
    const respond = modifications.respond;
    const payload = typeof respond === 'function' ? await respond() : respond;
    const response = await util.response.fromPayload(payload, modifications);
    const elapsed = timer.elapsed;
    fire({
      type: 'HTTP/after',
      payload: { uid, method, url, response, elapsed },
    });
    return response;
  } else {
    // Invoke the HTTP service end-point.
    const fetched = await args.fetch({
      url,
      mode,
      method,
      headers: modifications.headers || headers,
      data,
    });

    // Prepare response.
    const response = await util.response.fromFetch(fetched);
    const elapsed = timer.elapsed;
    fire({
      type: 'HTTP/after',
      payload: { uid, method, url, response, elapsed },
    });

    // Finish up.
    return response;
  }
};

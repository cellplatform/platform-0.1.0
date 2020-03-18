import { id, t, time, util } from '../common';

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

  type M = { data?: any; headers?: t.IHttpHeaders; respond?: t.HttpRespondInput };
  const modifications: M = {
    data: undefined,
    headers: args.headers,
    respond: undefined,
  };

  // Fire BEFORE event.
  const before: t.IHttpBefore = {
    uid,
    method,
    url,
    data,
    headers,
    isModified: false,
    modify(args: { data?: any; headers?: t.IHttpHeaders }) {
      before.isModified = true;
      if (args.data !== undefined) {
        modifications.data = args.data;
      }
      if (args.headers !== undefined) {
        modifications.headers = args.headers;
      }
    },
    respond(input) {
      modifications.respond = input;
    },
  };
  fire({ type: 'HTTP/before', payload: before });

  if (modifications.respond) {
    // Exit with faked/overridden response if one was returned via the BEFORE event.
    const respond = modifications.respond;
    const payload = typeof respond === 'function' ? await respond() : respond;
    const response = await util.response.fromPayload(url, payload, modifications);
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
      headers,
      data: modifications.data || data,
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

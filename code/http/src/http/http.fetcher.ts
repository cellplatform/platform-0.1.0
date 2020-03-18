import { id, t, time, toRawHeaders, toResponse, util } from '../common';

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

  const modifications: {
    data?: any;
    headers?: t.IHttpHeaders;
    respond?: t.HttpRespondInput;
  } = {
    data: undefined,
    headers: undefined,
    respond: undefined,
  };

  const payloadToResponse = async (url: string, payload: t.IHttpRespondPayload) => {
    const ok = payload.status.toString()[0] === '2';
    const { status, statusText = '' } = payload;
    const data = payload.data || modifications.data;

    let head = payload.headers || headers || {};
    if (!util.getHeader('content-type', head)) {
      head = {
        ...head,
        'content-type': payload.data ? 'application/json' : 'application/octet-stream',
      };
    }

    const toText = () => {
      if (!data) {
        return '';
      }
      if (typeof data === 'string') {
        return data;
      }
      return util.stringify(
        data,
        () => `Failed while serializing data to JSON within [text] method.`,
      );
    };

    const res: t.IHttpResponseLike = {
      ok,
      status,
      statusText,
      headers: toRawHeaders(head),
      body: typeof data?.pipe === 'function' ? data : null,
      async text() {
        return toText();
      },
    };

    return toResponse(url, res);
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
    // Exit with faked/overridden response if one was returned from the BEFORE event.
    const respond = modifications.respond;
    const payload = typeof respond === 'function' ? await respond() : respond;
    const response = await payloadToResponse(url, payload);
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
    const response = await payloadToResponse(url, fetched);
    const elapsed = timer.elapsed;
    fire({
      type: 'HTTP/after',
      payload: { uid, method, url, response, elapsed },
    });

    // Finish up.
    return response;
  }
};

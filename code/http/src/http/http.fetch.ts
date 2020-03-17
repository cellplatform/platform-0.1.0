import { fetch, id, t, time, toRawHeaders, toBody, toResponse } from '../common';

export const fetcher = async (args: {
  url: string;
  method: t.HttpMethod;
  fire: t.FireEvent;
  mode: t.HttpCors;
  headers: t.IHttpHeaders;
  data?: any;
}) => {
  // Prepare arguments.
  const timer = time.timer();
  const uid = `req:${id.shortid()}`;
  const { url, method, data, fire, mode, headers } = args;

  const modifications: {
    data?: any | Buffer;
    headers?: t.IHttpHeaders;
    respond?: t.HttpRespondMethodArg;
  } = {
    data: undefined,
    headers: undefined,
    respond: undefined,
  };

  const toPayload = async (arg: t.HttpRespondMethodArg) => {
    return typeof arg === 'function' ? arg() : arg;
  };

  const payloadToResponse = async (url: string, payload: t.HttpRespondPayload) => {
    const ok = payload.status.toString()[0] === '2';
    const { status, statusText = '' } = payload;
    const data = payload.data || modifications.data || args.data;

    let head = payload.headers || headers || {};
    const contentTypeKey = Object.keys(head).find(key => key.toLowerCase() === 'content-type');
    if (!contentTypeKey) {
      const contentType = payload.data ? 'application/json' : 'application/octet-stream';
      head = { ...headers, 'content-type': contentType };
    }

    const res: t.IHttpResponseLike = {
      ok,
      status,
      statusText,
      headers: toRawHeaders(head),
      body: typeof data?.pipe === 'function' ? data : null,
      async text() {
        return data ? JSON.stringify(data) : '';
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

  const prepareHeaders = () => {
    return toRawHeaders({ ...headers, ...modifications.headers });
  };
  const prepareData = () => {
    const headers = prepareHeaders();
    const body = modifications.data || data;
    return body ? toBody({ url, headers, data: body }) : undefined;
  };

  if (modifications.respond) {
    // Exit with faked/overridden response if one was returned from the BEFORE event.
    const response = await payloadToResponse(url, await toPayload(modifications.respond));
    const elapsed = timer.elapsed;
    fire({
      type: 'HTTP/after',
      payload: { uid, method, url, response, elapsed },
    });
    return response;
  } else {
    // Invoke the HTTP service.
    const fetched = await fetch(url, {
      method,
      mode,
      body: prepareData(),
      headers: prepareHeaders(),
    });

    // Prepare response.
    const response = await toResponse(url, fetched);
    const elapsed = timer.elapsed;
    fire({
      type: 'HTTP/after',
      payload: { uid, method, url, response, elapsed },
    });

    // Finish up.
    return response;
  }
};

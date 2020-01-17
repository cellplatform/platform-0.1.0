import { fetch, id, t, time, toRawHeaders, toBody, toResponse } from '../common';

export const send = async (args: {
  url: string;
  method: t.HttpMethod;
  data?: any;
  options: t.IFetchOptions;
  fire: t.FireEvent;
}) => {
  // Prepare arguments.
  const timer = time.timer();
  const eid = id.shortid();
  const options = args.options;
  const { mode, headers = {} } = options;
  const { url, method, data, fire } = args;

  const modifications: {
    data?: any | Buffer;
    headers?: t.IHttpHeaders;
    response?: t.IHttpResponseLike;
    responseDelay?: number;
  } = {
    data: undefined,
    headers: undefined,
    response: undefined,
    responseDelay: undefined,
  };

  const respond: t.HttpRespond = (status, options = {}) => {
    const ok = status.toString()[0] === '2';
    const { statusText = '' } = options;
    const data = options.data || modifications.data || args.data;

    let head = options.headers || headers || {};
    const contentTypeKey = Object.keys(head).find(key => key.toLowerCase() === 'content-type');
    if (!contentTypeKey) {
      const contentType = options.data ? 'application/json' : 'application/octet-stream';
      head = { ...headers, 'content-type': contentType };
    }

    modifications.response = {
      ok,
      status,
      statusText,
      headers: toRawHeaders(head),
      body: typeof data?.pipe === 'function' ? data : null,
      async text() {
        return data ? JSON.stringify(data) : '';
      },
    };

    if (typeof options.delay === 'number') {
      modifications.responseDelay = options.delay;
    }
  };

  // Fire BEFORE event.
  const before: t.IHttpBefore = {
    eid,
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
    respond,
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

  if (modifications.response) {
    // Exit with faked response if one was
    // returned from the BEFORE event.
    const delay = modifications.responseDelay;
    if (typeof delay === 'number') {
      await time.wait(delay);
    }
    const response = await toResponse(url, modifications.response);
    const elapsed = timer.elapsed;
    fire({
      type: 'HTTP/after',
      payload: { eid, method, url, response, elapsed },
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

    // Finish up.
    const response = await toResponse(url, fetched);
    const elapsed = timer.elapsed;
    fire({
      type: 'HTTP/after',
      payload: { eid, method, url, response, elapsed },
    });
    return response;
  }
};

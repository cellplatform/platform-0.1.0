import { send } from 'micro';

import { t, time } from '../common';

const NOT_FOUND: t.RouteResponse = {
  status: 404,
  data: { status: 404, message: 'Not found' },
};

/**
 * Handles an HTTP request.
 */
export function requestHandler(args: { router: t.IRouter; fire: t.FireEvent }): t.RequestHandler {
  const { router, fire } = args;

  return async (incoming, outgoing) => {
    const req = (incoming as unknown) as t.IncomingMessage;
    const res = (outgoing as unknown) as t.ServerResponse;

    const timer = time.timer();
    const method = req.method as t.HttpMethod;
    const url = req.url || '';

    type P = Promise<void> | undefined;
    const modifying = {
      request: undefined as P,
      response: undefined as P,
    };

    // Fire BEFORE-event.
    let context: any = {};
    const before: t.IMicroRequest = {
      isModified: false,
      method,
      url,
      req,
      modify(input) {
        if (input) {
          before.isModified = true;
          if (typeof input !== 'function') {
            if (input.context) {
              context = input.context;
            }
          } else {
            modifying.request = new Promise(async resolve => {
              try {
                const res = await input();
                if (res.context) {
                  context = res.context;
                }
                resolve();
              } catch (error) {
                before.error = error.message;
              }
            });
          }
        }
      },
    };
    fire({ type: 'HTTP/request', payload: before });

    // Wait for the request modification [Promise] to complete
    // if an event listener modified the payload asynchronously.
    if (modifying.request) {
      await modifying.request;
    }

    // Handle the request.
    let handled = (await router.handler((req as unknown) as t.HttpRequest, context)) || NOT_FOUND;

    // Fire AFTER-event.
    const after: t.IMicroResponse = {
      elapsed: timer.elapsed,
      isModified: false,
      context,
      method,
      url,
      req,
      res: { ...handled },
      modify(input) {
        if (input) {
          after.isModified = true;
          if (typeof input !== 'function') {
            handled = input;
          } else {
            modifying.response = new Promise(async resolve => {
              try {
                handled = await input();
                after.elapsed = timer.elapsed;
                resolve();
              } catch (error) {
                after.error = error.message;
              }
            });
          }
        }
      },
    };
    fire({ type: 'HTTP/response', payload: after });

    // Wait for the response modification [Promise] to complete
    // if an event listener modified the payload asynchronously.
    if (modifying.response) {
      await modifying.response;
    }

    // Prepare for sending.
    setHeaders(res, handled.headers);
    const status = handled.status || 200;

    if (status.toString().startsWith('3')) {
      return redirect(res, status, handled.data);
    } else {
      return send(res, status, handled.data);
    }
  };
}

/**
 * [Helpers]
 */
function redirect(res: t.ServerResponse, statusCode: number, location: string) {
  if (!location) {
    throw new Error('Redirect location required');
  }
  res.statusCode = statusCode;
  res.setHeader('Location', location);
  res.end();
}

function setHeaders(res: t.ServerResponse, headers?: t.IHttpHeaders) {
  if (headers) {
    Object.keys(headers).forEach(key => res.setHeader(key, headers[key]));
  }
}

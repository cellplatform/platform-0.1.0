import micro, { send } from 'micro';
import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { log, t, time } from '../common';
import { Router } from '../routing';

export * from '../types';

const cors = require('micro-cors')();
const IS_PROD = process.env.NODE_ENV === 'production';
const NOT_FOUND: t.RouteResponse = {
  status: 404,
  data: { status: 404, message: 'Not found' },
};

/**
 * Initialize the [server].
 */
export function init(args: { port?: number; log?: t.ILogProps; cors?: boolean } = {}) {
  // Setup initial conditions.
  const timer = time.timer();
  const router = Router.create();

  const _events$ = new Subject<t.MicroEvent>();
  const events$ = _events$.pipe(share());
  const response$ = _events$.pipe(
    filter(e => e.type === 'HTTP/response'),
    map(e => e.payload as t.IMicroResponse),
    share(),
  );
  const fire: t.FireEvent = e => _events$.next(e);

  // Initialize the [micro] server.
  let handler = requestHandler({ router, fire });
  handler = args.cors ? cors(handler) : handler;
  const server = micro(handler as any);

  /**
   * [Start] the server listening for requests.
   */
  const start: t.ServerStart = (options = {}) => {
    const promise = new Promise<t.IMicroService>((resolve, reject) => {
      const port = options.port || args.port || 3000;

      const stop: t.IMicroService['stop'] = () => {
        return new Promise(async (resolve, reject) => {
          if (!service.isRunning) {
            return resolve(); // Already stopped.
          } else {
            listener.close(err => {
              service.isRunning = false;
              api.service = undefined;
              fire({
                type: 'HTTP/stopped',
                payload: {
                  port,
                  elapsed: timer.elapsed,
                  error: err ? err.message : undefined,
                },
              });
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }
        });
      };

      const service: t.IMicroService = { events$, response$, isRunning: true, port, stop };
      api.service = service;

      const listener = server.listen({ port }, () => {
        fire({
          type: 'HTTP/started',
          payload: { elapsed: timer.elapsed, port },
        });

        if (!options.silent) {
          const elapsed = log.gray(`[${timer.elapsed.toString()}]`);
          const url = log.cyan(`http://localhost:${log.magenta(port)} ${elapsed}`);
          const props = { ...(options.log || args.log || {}), prod: IS_PROD };
          const keys = Object.keys(props);
          const max = keys.reduce((acc, next) => (next.length > acc ? next.length : acc), 0) + 2;

          log.info();
          log.info.gray(`👋  Running on ${url}`);
          log.info();
          keys.forEach(key => {
            const prefix = `${key}:${' '.repeat(10)}`.substring(0, max);
            log.info.gray(`   - ${prefix} ${props[key].toString()}`);
          });
          log.info();
        }

        resolve(service);
      });
    });

    return promise;
  };

  /**
   * Stop the running micro [Service].
   */
  const stop: t.IMicro['stop'] = async () => (api.service ? api.service.stop() : {});

  // Finish up.
  const api: t.IMicro = { events$, response$, server, router, handler, start, stop };
  return api;
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

function requestHandler(args: { router: t.IRouter; fire: t.FireEvent }): t.RequestHandler {
  const { router, fire } = args;
  return async (req, res) => {
    const timer = time.timer();
    const method = req.method as t.HttpMethod;
    const url = req.url || '';
    const modifying = {
      response: undefined as Promise<void> | undefined,
    };

    // Fire BEFORE-event.
    fire({
      type: 'HTTP/request',
      payload: { method, url, req },
    });

    // Handle the request.
    let handled = (await router.handler(req)) || NOT_FOUND;

    // Fire AFTER-event.
    const after: t.IMicroResponse = {
      elapsed: timer.elapsed,
      isModified: false,
      method,
      url,
      req,
      res: { ...handled },
      modify(input) {
        after.isModified = true;
        if (typeof input !== 'function') {
          handled = input;
        } else {
          modifying.response = new Promise(async (resolve, reject) => {
            try {
              handled = await input();
              after.elapsed = timer.elapsed;
              resolve();
            } catch (error) {
              after.error = error.message;
            }
          });
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

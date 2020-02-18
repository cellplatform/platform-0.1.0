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
export function init(
  args: { log?: t.ILogProps; cors?: boolean; port?: number; logger?: t.ILog } = {},
) {
  // Setup initial conditions.
  const timer = time.timer();
  const router = Router.create();
  const logger = args.logger || log;

  const _events$ = new Subject<t.MicroEvent>();
  const events$ = _events$.pipe(share());
  const request$ = _events$.pipe(
    filter(e => e.type === 'HTTP/request'),
    map(e => e.payload as t.IMicroRequest),
    share(),
  );
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

      const service: t.IMicroService = {
        isRunning: true,
        events$,
        request$,
        response$,
        port,
        stop,
      };
      api.service = service;

      const listener = server.listen({ port }, () => {
        const elapsed = timer.elapsed;

        if (!options.silent) {
          const elapsed = log.gray(`[${timer.elapsed.toString()}]`);
          const url = log.cyan(`http://localhost:${log.magenta(port)} ${elapsed}`);
          const props = { ...(options.log || args.log || {}), prod: IS_PROD };
          const keys = Object.keys(props);
          const max = keys.reduce((acc, next) => (next.length > acc ? next.length : acc), 0) + 2;

          logger.info();
          logger.info.gray(`👋  Running on ${url}`);
          logger.info();
          keys.forEach(key => {
            const prefix = `${key}:${' '.repeat(10)}`.substring(0, max);
            logger.info.gray(`   • ${prefix} ${props[key].toString()}`);
          });
          logger.info();
        }

        fire({
          type: 'HTTP/started',
          payload: { elapsed, port },
        });

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
  const api: t.IMicro = { events$, request$, response$, server, router, handler, start, stop };
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
    let handled = (await router.handler(req, context)) || NOT_FOUND;

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

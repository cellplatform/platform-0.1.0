import micro from 'micro';
import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { bodyParser } from '../body';
import { log, Router, t, time } from '../common';
import { requestHandler } from './server.requestHandler';

export * from '../types';

const cors = require('micro-cors')();
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Initialize the [server].
 */
export function init(
  args: { log?: t.ILogProps; cors?: boolean; port?: number; logger?: t.ILog } = {},
) {
  // Setup initial conditions.
  const timer = time.timer();
  const router = Router.create({ bodyParser });
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

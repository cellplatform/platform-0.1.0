import micro from 'micro';
import { Subject } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

import { body } from '../body';
import { log, Router, t, time, value, parsePort } from '../common';
import { requestHandler } from './server.requestHandler';

export * from '../types';

const cors = require('micro-cors')(); // eslint-disable-line

/**
 * Initialize the [server].
 */
export function create(
  args: {
    log?: t.ILogProps;
    cors?: boolean;
    port?: number;
    logger?: t.ILog;
    router?: t.IRouter;
  } = {},
) {
  // Setup initial conditions.
  const timer = time.timer();
  const router = args.router || Router.create({ body });
  const logger = args.logger || log;

  const is = {
    prod: process.env.NODE_ENV === 'production',
  };

  const _events$ = new Subject<t.MicroEvent>();
  const events$ = _events$.pipe();
  const request$ = _events$.pipe(
    filter((e) => e.type === 'SERVICE/request'),
    map((e) => e.payload as t.MicroRequest),
    share(),
  );
  const response$ = _events$.pipe(
    filter((e) => e.type === 'SERVICE/response'),
    map((e) => e.payload as t.MicroResponse),
    share(),
  );
  const fire: t.FireEvent = (e) => _events$.next(e);

  // Initialize the [micro] server.
  let handler = requestHandler({ router, fire });
  handler = args.cors ? cors(handler) : handler;
  const server = micro(handler as any);

  /**
   * [Start] the server listening for requests.
   */
  const start: t.ServerStart = (options = {}) => {
    const promise = new Promise<t.IMicroService>((resolve, reject) => {
      const PORT = parsePort(options.port || args.port || 3000);
      const port = PORT.internal;

      const stop: t.IMicroService['stop'] = () => {
        return new Promise<void>(async (resolve, reject) => {
          if (!service.isRunning) return resolve(); // Already stopped.

          listener.close((err) => {
            service.isRunning = false;
            api.service = undefined;
            const error = err ? err.message : undefined;
            fire({
              type: 'SERVICE/stopped',
              payload: { port, elapsed: timer.elapsed, error },
            });
            if (err) return reject(err);
            if (!err) return resolve();
          });
        });
      };

      const service: t.IMicroService = {
        isRunning: true,
        events$,
        request$,
        response$,
        port: PORT.internal,
        stop,
      };
      api.service = service;

      const listener = server.listen({ port }, () => {
        const elapsed = timer.elapsed;

        if (!options.silent) {
          const elapsed = log.gray(`[${timer.elapsed.toString()}]`);
          const portMap = PORT.internal === PORT.external ? '' : log.gray(` ⬅︎ ${PORT.internal}`);
          const url = log.cyan(`http://localhost:${log.white(PORT.external)}${portMap} ${elapsed}`);
          const props = value.deleteUndefined({
            ...(options.log || args.log || {}),
            prod: is.prod,
          });
          const keys = Object.keys(props);
          const max = keys.reduce((acc, next) => (next.length > acc ? next.length : acc), 0) + 2;

          logger.info();
          logger.info.gray(`👋 Running on ${url}`);
          logger.info();
          keys.forEach((key) => {
            const prefix = `${key}${' '.repeat(10)}`.substring(0, max);
            logger.info.gray(`   • ${prefix} ${props[key].toString()}`);
          });
          logger.info();
        }

        fire({ type: 'SERVICE/started', payload: { elapsed, port } });
        resolve(service);
      });
    });

    return promise;
  };

  /**
   * Stop the running micro [Service].
   */
  const stop: t.IMicro['stop'] = async () => {
    if (api.service) {
      await api.service.stop();
    }
  };

  // Finish up.
  const api: t.IMicro = { events$, request$, response$, server, router, handler, start, stop };
  return api;
}

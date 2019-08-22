import micro, { send } from 'micro';

import { log, t } from '../common';
import { Router } from '../routing';
export * from '../types';

const cors = require('micro-cors')();

const IS_PROD = process.env.NODE_ENV === 'production';
const NOT_FOUND: t.RouteResponse = {
  status: 404,
  data: { status: 404, message: 'Not found.' },
};

type ILogProps = { [key: string]: string | number | boolean };

/**
 * Initialize the [server].
 */
export function init(args: { port?: number; log?: ILogProps; cors?: boolean } = {}) {
  const router = Router.create();
  let handler = requestHandler(router);
  handler = args.cors ? cors(handler) : handler;

  const server = micro(handler);

  /**
   * [Start] the server listening for requests.
   */
  const listen = async (options: { port?: number; log?: ILogProps; silent?: boolean } = {}) => {
    const port = options.port || args.port || 3000;
    await server.listen({ port });

    if (!options.silent) {
      const url = log.cyan(`http://localhost:${log.magenta(port)}`);
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
  };

  // Finish up.
  return { listen, server, router, handler };
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

function requestHandler(router: Router): t.RequestHandler {
  return async (req, res) => {
    const handled = (await router.handler(req)) || NOT_FOUND;
    setHeaders(res, handled.headers);
    const status = handled.status || 200;
    if (status.toString().startsWith('3')) {
      return redirect(res, status, handled.data);
    } else {
      return send(res, status, handled.data);
    }
  };
}

function setHeaders(res: t.ServerResponse, headers?: t.IHttpHeaders) {
  if (headers) {
    Object.keys(headers).forEach(key => res.setHeader(key, headers[key]));
  }
}

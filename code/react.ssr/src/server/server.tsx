import micro, { send } from 'micro';

import { fs, is, log, t } from '../common';
import * as routes from './routes';

const PKG = require(fs.resolve('package.json')) as { name: string; version: string };
const NOT_FOUND = {
  status: 404,
  data: { status: 404, message: `Not found.` },
};

export * from '../types';

/**
 * Initialize the [server].
 */
export function init(args: { manifestUrl: string; cdnUrl?: string; apiSecret?: string }) {
  const { manifestUrl, cdnUrl, apiSecret } = args;

  const router = routes.init({ manifestUrl, cdnUrl, apiSecret });

  const handler: t.RequestHandler = async (req, res) => {
    const handled = (await router.handler(req)) || NOT_FOUND;
    const status = handled.status || 200;
    if (status.toString().startsWith('3')) {
      return redirect(res, status, handled.data);
    } else {
      return send(res, status, handled.data);
    }
  };

  const server = micro(handler);

  /**
   * [Start] the server listening for requests.
   */
  const listen = async (options: { port?: number; silent?: boolean } = {}) => {
    const port = options.port || 3000;
    await server.listen({ port });

    if (!options.silent) {
      const url = log.cyan(`http://localhost:${log.magenta(port)}`);
      log.info();
      log.info.gray(`👋  Running on ${url}`);
      log.info();
      log.info.gray(`   - version:    ${log.white(PKG.version)}`);
      log.info.gray(`   - package:    ${PKG.name}`);
      log.info.gray(`   - prod:       ${is.prod}`);
      log.info.gray(`   - secret:     ${Boolean(apiSecret)}`);
      log.info.gray(`   - manifest:   ${manifestUrl}`);
      log.info.gray(`   - cdn:        ${cdnUrl ? cdnUrl : 'false'}`);
      log.info();
    }
  };

  // Finish up.
  return { listen, server, handler };
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

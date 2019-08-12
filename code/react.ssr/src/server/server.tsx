import { cors, express, fs, helmet, is, log } from '../common';
import * as router from './router';

const PKG = require(fs.resolve('package.json')) as { name: string; version: string };
export * from '../types';

/**
 * Initialize the [server].
 */
export function init(args: { manifestUrl: string; cdnUrl?: string; apiSecret?: string }) {
  const { manifestUrl, cdnUrl, apiSecret } = args;

  /**
   * Create the express web server.
   */
  const app = express()
    .use(helmet())
    .use(cors())
    .use(router.init({ manifestUrl, cdnUrl, apiSecret }));

  /**
   * [Start] the server listening for requests.
   */
  const start = async (options: { port?: number; silent?: boolean } = {}) => {
    const port = options.port || 3000;
    await app.listen({ port });

    if (!options.silent) {
      const url = log.cyan(`http://localhost:${log.magenta(port)}`);
      log.info();
      log.info.gray(`👋  Running on ${url}`);
      log.info();
      log.info.gray(`   - version:   ${log.white(PKG.version)}`);
      log.info.gray(`   - package:   ${PKG.name}`);
      log.info.gray(`   - prod:      ${is.prod}`);
      log.info.gray(`   - manifest:  ${manifestUrl}`);
      log.info.gray(`   - cdn:       ${cdnUrl ? cdnUrl : 'false'}`);
      log.info();
    }
  };

  // Finish up.
  return { start };
}

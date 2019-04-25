import { log, express } from './common';
import { router } from './routes';

const server = express().use(router);

/**
 * Startup
 */
export function start() {
  return new Promise((resolve, reject) => {
    const port = 8080;
    server.listen(port, () => {
      const url = log.cyan(`http://localhost:${log.magenta(port)}`);
      log.info.gray(`\n👋  Auth server on ${url}`);
      log.info();
      resolve();
    });
  });
}

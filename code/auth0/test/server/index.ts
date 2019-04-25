import { log } from './common';
import * as express from 'express';

const server = express();

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

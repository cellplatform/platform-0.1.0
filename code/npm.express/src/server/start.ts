import * as minimist from 'minimist';

import { is, log } from '../common';
import { init } from './server';

/**
 * Retrieve command-line args.
 */
const argv = minimist(process.argv.slice(2));
const port = argv.PORT || 3000;
const name = argv.NODE_MODULE;
if (!name) {
  throw new Error(`A --NODE_MODULE=<name> value must be passed at startup.`);
}

/**
 * Start the server.
 */
const { server, dir } = init({ name });
server.listen(port, () => {
  const url = log.cyan(`http://localhost:${log.magenta(port)}`);
  log.info.gray(`\n👋  Running on ${url}`);
  log.info.gray(`   - module:  ${name}`);
  log.info.gray(`   - dir:     ${dir}`);
  log.info.gray(`   - prod:    ${is.prod}`);
  log.info();
});

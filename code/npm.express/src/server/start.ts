import * as minimist from 'minimist';

import { is, log } from '../common';
import { init } from './server';
import { start } from '../router/routes.run';

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
server.listen(port, async () => {
  const url = log.cyan(`http://localhost:${log.magenta(port)}`);
  log.info.gray(`\n👋  Running on ${url}`);
  log.info();
  log.info.gray(`   - module:  ${name}`);
  log.info.gray(`   - dir:     ${dir}`);
  log.info.gray(`   - prod:    ${is.prod}`);
  log.info();

  await start({ name, dir });
});

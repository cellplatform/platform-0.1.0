import { server, log } from './server';

const pkg = require('../../../package.json');

/**
 * Start the server.
 */
(async () => {
  const port = 8080;
  await server.listen({ port });

  const url = log.cyan(`http://localhost:${log.magenta(port)}${log.gray('/graphql')}`);
  log.info.gray(`\n👋  Running on ${url}`);
  log.info();
  log.info.gray(`   - package:   ${pkg.name} (test)`);
  log.info.gray(`   - version:   ${pkg.version}`);
  log.info();
})();

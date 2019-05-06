import { server } from './graphql';
import { log, is, pkg } from './common';

(async () => {
  const port = 5000;
  await server.listen({ port });

  const url = log.cyan(`http://localhost:${log.magenta(port)}${log.gray('/graphql')}`);
  log.info.gray(`\n👋  Running on ${url}`);
  log.info();
  log.info.gray(`   - version:   ${pkg.version}`);
  log.info.gray(`   - prod:      ${is.prod}`);
  log.info();
})();

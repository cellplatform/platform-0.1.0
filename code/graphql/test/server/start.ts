import { ApolloServer, log, is } from './common';
import { init } from './schema';

const pkg = require('../../../package.json');
const schema = init({});
const server = new ApolloServer({ schema });

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

import * as http from 'http';
import { ApolloServer, is, log } from './common';
import { init } from './schema';

const pkg = require('../../../package.json');

/**
 * [Graphql]
 */
const schema = init({});
const graphql = new ApolloServer({
  schema,
  context(e) {
    const headers = e.req.headers;
    log.info(`🌼  ${log.yellow('Headers:')}\n\n`, headers, '\n');
  },
});

/**
 * Start within an HTTP server.
 */
const server = new http.Server(graphql.createHandler({ path: '/graphql' }));
const PORT = 5000;
server.listen(PORT, () => {
  const url = log.cyan(`http://localhost:${log.magenta(PORT)}${log.gray('/graphql')}`);
  log.info.gray(`\n👋  Running on ${url}`);
  log.info();
  log.info.gray(`   - version:   ${log.white(pkg.version)}`);
  log.info.gray(`   - package:   ${pkg.name}`);
  log.info.gray(`   - prod:      ${is.prod}`);
  log.info();
});

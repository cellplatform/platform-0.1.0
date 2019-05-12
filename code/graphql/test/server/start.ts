import { ApolloServer, express, is, log } from './common';
import { init } from './schema';

const pkg = require('../../../package.json');
const schema = init({});

/**
 * [Express] web server.
 */
export const app = express();

/**
 * [GraphQL] server.
 */
export const server = new ApolloServer({
  schema,
  context(e) {
    const headers = e.req.headers;
    log.info(`🌼  ${log.yellow('Headers:')}\n\n`, headers, '\n');
  },
});
server.applyMiddleware({ app });

const port = 5000;
app.listen({ port }, () => {
  const url = log.cyan(`http://localhost:${log.magenta(port)}${log.gray('/graphql')}`);
  log.info.gray(`\n👋  Running on ${url}`);
  log.info();
  log.info.gray(`   - version:   ${log.white(pkg.version)}`);
  log.info.gray(`   - package:   ${pkg.name}`);
  log.info.gray(`   - prod:      ${is.prod}`);
  log.info();
});

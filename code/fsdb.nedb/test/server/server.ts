import { ApolloServer, express, id, t } from './common';
import { schema } from './schema';

/**
 * Server
 */
export const app = express();
export const server = new ApolloServer({
  schema,
  async context(e): Promise<t.IGqlContext> {
    const jwt = e.req.headers.authorization;
    const requestId = id.shortid();
    return { jwt, requestId };
  },
});

server.applyMiddleware({ app });

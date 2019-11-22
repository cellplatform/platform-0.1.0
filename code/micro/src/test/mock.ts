import { value } from '../common';
import { micro } from '..';

/**
 * Mock micro-service.
 */
export async function mockServer(args: { port?: number; silent?: boolean } = {}) {
  const port = args.port || randomPort();
  const app = micro.init();
  const silent = value.defaultValue(args.silent, true);
  const instance = await app.listen({ port, silent });
  return {
    port,
    app,
    instance,
    url: (path: string) => `http://localhost:${port}/${path.replace(/^\/*/, '')}`,
    async dispose() {
      await instance.close();
    },
  };
}

/**
 * Helpers
 */
const randomPort = () => {
  return value.toNumber(
    `${value.random(6, 9)}${value.random(0, 9)}${value.random(0, 9)}${value.random(0, 9)}`,
  );
};

import { value } from '../common';
import { micro } from '..';

/**
 * Mock micro-service.
 */
export async function mockServer(args: { port?: number; silent?: boolean } = {}) {
  const port = args.port || randomPort();
  const app = micro.create();
  const silent = value.defaultValue(args.silent, true);
  const instance = await app.start({ port, silent });
  const router = app.router;
  return {
    port,
    app,
    instance,
    router,
    url: (path: string) => `http://localhost:${port}/${path.replace(/^\/*/, '')}`,
    async dispose() {
      await app.stop();
    },
  };
}

/**
 * Generate a random port number.
 */
export const randomPort = () => {
  return value.toNumber(
    `${value.random(6, 9)}${value.random(0, 9)}${value.random(0, 9)}${value.random(0, 9)}`,
  );
};

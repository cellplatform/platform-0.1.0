import { micro } from '../common';
import { Config } from '../config';
import * as routes from './routes';

export * from '../types';

/**
 * Initialize the [server].
 */
export function create(args: { manifestUrl: string; baseUrl: string }) {
  const { manifestUrl, baseUrl } = args;
  const app = micro.init({
    log: {
      manifest: manifestUrl,
      base: baseUrl,
    },
  });
  routes.init({ router: app.router, manifestUrl, baseUrl });
  return app;
}

export function fromConfig() {
  const config = Config.createSync();
  const manifestUrl = config.manifest.s3.url;
  const baseUrl = config.baseUrl;
  return create({ manifestUrl, baseUrl });
}

import { constants, log, micro, t, value, Router, fs as filesystem } from '../common';
import { beforeResponse } from './global';
import * as logger from './logger';

export { logger };
export { Config } from './config';

const { PKG } = constants;

/**
 * Initializes a new server instance.
 */
export function create(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  runtime?: t.RuntimeEnv;
  name?: string;
  deployedAt?: number | string;
  logger?: t.ILog;
  region?: string;
}) {
  const { db, name, fs, runtime } = args;
  const logger = args.logger || log;
  const base = filesystem.resolve('.');
  const dir = fs.dir.startsWith(base) ? fs.dir.substring(base.length) : fs.dir;
  const deployedAt =
    typeof args.deployedAt === 'string' ? value.toNumber(args.deployedAt) : args.deployedAt;

  // Log any uncaught exceptions.
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION');
    logger.error(err.message);
    logger.info();
  });

  // Routes.
  const body = micro.body;
  const router = Router.create({ name, db, fs, runtime, body, deployedAt });

  // Setup the micro-service.
  const deps = PKG.dependencies || {};
  const app = micro.create({
    cors: true,
    logger,
    router,
    log: {
      runtime: runtime
        ? log.gray(`${Format.namespace(runtime.name)}@${runtime.version}`)
        : undefined,
      server: `${PKG.name}@${PKG.version}`,
      router: `- v${deps['@platform/cell.router']}`,
      schema: `- v${deps['@platform/cell.schema']}`,
      region: args.region ?? constants.CELL_REGION,
      fs: `[${log.white(fs.type === 'LOCAL' ? 'local' : fs.type)}]${dir}`,
      'fs:s3': fs.type == 'S3' ? fs.endpoint.origin : undefined,
    },
  });

  // Make common checks/adjustments to responses before they are sent over the wire.
  app.response$.subscribe(beforeResponse({ router }));

  // Finish up.
  return app;
}

/**
 * [Helpers]
 */

const Format = {
  namespace(input: string) {
    const parts = (input || '').trim().split('.');
    const formatted = parts.map((part, i) => (i === parts.length - 1 ? log.white(part) : part));
    return log.cyan(formatted.join('.'));
  },
};

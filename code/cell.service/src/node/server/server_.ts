import { constants, fs as filesystem, log, micro, Router, t, value } from '../common';
import { beforeRequest } from './before.request';
import { beforeResponse } from './before.response';
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
  authorize?: t.HttpAuthorize;
}) {
  const { db, name, fs, runtime, authorize } = args;
  const logger = args.logger || log;
  const { cyan, gray, white } = logger;
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
      runtime: runtime ? gray(`${Format.namespace(runtime.name)}@${runtime.version}`) : undefined,
      server: Format.package('@platform/', cyan('cell.service'), PKG.version),
      router: Format.package('          ', cyan('cell.router'), deps['@platform/cell.router']),
      schema: Format.package('          ', cyan('cell.schema'), deps['@platform/cell.schema']),
      region: args.region ?? constants.CELL_REGION,
      fs: `[${white(fs.type === 'LOCAL' ? 'local' : fs.type)}]${dir}`,
      'fs:s3': fs.type === 'S3' ? fs.endpoint.origin : undefined,
    },
  });

  // Make common checks/adjustments.
  app.request$.subscribe(beforeRequest({ router, authorize }));
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

  package(ns: string, name: string, version: string) {
    return log.gray(`${ns}${name}@${version}`);
  },
};

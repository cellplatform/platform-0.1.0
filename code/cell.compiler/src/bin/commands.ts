import { fs, log, minimist, t } from '../common';
import { Webpack } from '../Webpack';
import * as util from './util';

type P = minimist.ParsedArgs;
const logger = util.logger;

/**
 * Bundle the project.
 */
export async function bundle(argv: P) {
  const params = util.params(argv);
  const config = await params.loadConfig();
  config.mode((params.mode as t.WebpackModel['mode']) || 'production');
  if (params.port) {
    config.port(params.port);
  }
  await Webpack.bundle(config);
}

/**
 * Bundle and start file watcher.
 */
export async function watch(argv: P) {
  logger.clear();
  const params = util.params(argv);
  const config = await params.loadConfig();
  config.mode((params.mode as t.WebpackModel['mode']) || 'development');
  await Webpack.watch(config);
}

/**
 * Start development server (HMR)
 */
export async function dev(argv: P) {
  logger.clear();
  const params = util.params(argv);
  const config = await params.loadConfig();
  config.mode('development');
  if (params.port) {
    config.port(params.port);
  }
  await Webpack.dev(config);
}

/**
 * Output info about the build.
 */
export async function info(argv: P) {
  const params = util.params(argv);
  const config = await params.loadConfig();

  if (params.mode) {
    config.mode(params.mode as t.WebpackModel['mode']);
  }

  if (params.port) {
    config.port(params.port);
  }

  logger.clear();
  logger.info(config);
}

/**
 * Remove transient build artifacts.
 */
export async function clean(argv: P) {
  const paths = ['dist', 'node_modules/.cache'].map((path) => fs.resolve(path));

  log.info();
  log.info.gray('Clean');
  paths.forEach((path) => {
    log.info(`  ${path}`);
  });
  log.info();

  await Promise.all(paths.map((path) => fs.remove(path)));
}

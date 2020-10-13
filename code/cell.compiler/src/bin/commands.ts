import { minimist, t, log } from '../common';
import { Webpack } from '../Webpack';
import * as util from './util';

type P = minimist.ParsedArgs;

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
  util.logger.clear();
  const params = util.params(argv);
  const config = await params.loadConfig();
  config.mode((params.mode as t.WebpackModel['mode']) || 'development');
  await Webpack.watch(config);
}

/**
 * Start development server (HMR)
 */
export async function dev(argv: P) {
  util.logger.clear();
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
  util.logger.clear();
  const params = util.params(argv);
  const config = await params.loadConfig();

  log.info.cyan('Configuration (Model)');
  log.info(config.toObject());

  log.info();
  log.info.cyan('Webpack');
  log.info(config.toWebpack());
}
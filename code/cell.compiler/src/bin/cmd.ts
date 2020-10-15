import { fs, log, minimist, Uri, t } from '../common';
import { Compiler } from '../Webpack';
import * as util from './util';

type P = minimist.ParsedArgs;

const logger = util.logger;

/**
 * Bundle the project.
 */
export async function bundle(argv: P) {
  const params = util.params(argv);
  const config = await params.loadConfig();

  if (params.mode) {
    config.mode(params.mode);
  }

  if (params.url) {
    config.url(params.url);
  }

  await Compiler.bundle(config);
}

/**
 * Bundle and start file watcher.
 */
export async function watch(argv: P) {
  logger.clear();
  const params = util.params(argv);
  const config = await params.loadConfig();

  if (params.mode) {
    config.mode(params.mode);
  }

  await Compiler.watch(config);
}

/**
 * Bundle and upload to a cell.
 */
export async function upload(argv: P) {
  const params = util.params(argv);
  const config = await params.loadConfig();
  const host = (params.host || '').trim();

  if (!host) {
    return logger.errorAndExit(1, `A ${log.cyan('--host')} argument was not provided.`);
  }

  // Wrangle the cell URI.
  const uri = params.uri;
  const cell = uri && typeof uri === 'string' ? Uri.parse<t.ICellUri>(uri) : undefined;
  if (!cell) {
    const err = `A ${log.cyan('--uri')} argument was not provided.`;
    return logger.errorAndExit(1, err);
  }
  if (!cell.ok) {
    const err = `The given ${log.cyan('--uri')} value '${log.white(uri)}' contained errors`;
    return logger.errorAndExit(1, err, cell.error?.message);
  }
  if (cell.type !== 'CELL') {
    const err = `The given ${log.cyan('--uri')} value '${log.white(uri)}' is not a cell URI.`;
    return logger.errorAndExit(1, err);
  }

  const targetDir = params.dir;
  return Compiler.cell(host, cell.toString()).upload(config, { targetDir });
}

/**
 * Start development server (HMR)
 */
export async function dev(argv: P) {
  logger.clear();
  const params = util.params(argv);
  const config = await params.loadConfig();

  config.mode('development');

  if (params.url) {
    config.url(params.url);
  }

  await Compiler.dev(config);
}

/**
 * Output info about the build.
 */
export async function info(argv: P) {
  const params = util.params(argv);
  const config = await params.loadConfig();
  log.info();
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

import { fs, log, t } from '../common';
import { logger } from './util';

type B = t.CompilerConfig;

const DEFAULT = {
  FILENAME: 'compiler.prod.js',
  PATH: 'lib/config/compiler.prod.js',
};

export async function loadConfig(file?: string): Promise<B> {
  // Wrangle path.
  let path = (typeof file === 'string' ? file : DEFAULT.PATH).trim();
  path = path ? fs.resolve(path) : path;
  path = path.trim();

  // Ensure configuration file exists
  if (!path) {
    logger.errorAndExit(1, `A path to the configuration file could not be derived.`);
  }
  if (await fs.is.dir(path)) {
    path = fs.join(path, DEFAULT.FILENAME);
    await ensureExists(path);
  }
  path = !path.endsWith('.js') ? `${path}.js` : path;
  await ensureExists(path);

  log.info.gray(`configuration:\n${path}`);

  // Retrieve the configuration.
  const imported = require(path).default; // eslint-disable-line

  // Run exported function.
  if (typeof imported === 'function') {
    const res = imported();
    const config = (res && typeof res.then === 'function' ? await res : res) as B;
    if (!config) {
      const err = `The default export did not return a configuration builder.\n${log.white(path)}`;
      logger.errorAndExit(1, err);
    }
    return config;
  }

  // Exported {object}.
  if (typeof imported !== 'object' && typeof imported.clone !== 'function') {
    logger.errorAndExit(
      1,
      `The default export was not a configuration builder.\n${log.white(path)}`,
    );
  }

  return imported.clone() as B;
}

/**
 * [Helpers]
 */

const ensureExists = async (path: string) => {
  if (!(await fs.pathExists(path))) {
    logger.errorAndExit(1, `The configuration file path does not exist ${log.white(path)}`);
  }
};

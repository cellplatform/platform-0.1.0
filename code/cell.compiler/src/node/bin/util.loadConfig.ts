import { fs, log, t, constants } from '../common';
import { logger } from './util';

type B = t.CompilerModelBuilder;

const DEFAULT = {
  FILENAME: 'compiler.config.js',
  PATH: 'lib/compiler.config.js',
};

export async function loadConfig(
  file?: string,
  options: { name?: string; silent?: boolean } = {},
): Promise<B> {
  const done = (config: B) => {
    const name = (options.name || '').trim();
    if (name) {
      if (!config.find(name)) {
        const err = `A configuration named '${log.white(name)}' was not found.`;
        logger.errorAndExit(1, err);
      }
      config = config.find(name) as B;
    }

    return config.clone();
  };

  // Wrangle path.
  let path = (typeof file === 'string' ? file : DEFAULT.PATH).trim();
  path = path ? fs.resolve(path) : path;
  path = path.trim();

  // Ensure configuration file exists.
  if (!path) {
    logger.errorAndExit(1, `A path to the configuration file could not be derived.`);
  }
  if (await fs.is.dir(path)) {
    path = fs.join(path, DEFAULT.FILENAME);
    await ensureExists(path);
  }
  path = !path.endsWith('.js') ? `${path}.js` : path;
  await ensureExists(path);

  // Log the configuration path being used.
  if (!options.silent) {
    const filename = fs.basename(path);
    const ext = fs.extname(filename);
    const file = filename.substring(0, filename.length - ext.length);
    log.info.gray(`configuration:`);
    log.info.gray(`${fs.dirname(path)}/${log.white(file)}${ext}`);
  }

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
    return done(config);
  }

  // Exported {object}.
  if (typeof imported !== 'object' && typeof imported.clone !== 'function') {
    const err = `The default export was not a configuration builder.\n${log.white(path)}`;
    logger.errorAndExit(1, err);
  }

  return done(imported as B);
}

/**
 * [Helpers]
 */

const ensureExists = async (path: string) => {
  if (!(await fs.pathExists(path))) {
    logger.errorAndExit(1, `The configuration file path does not exist ${log.white(path)}`);
  }
};

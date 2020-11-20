import { fs, log, t } from '../common';
import { DEFAULT } from '../constants';
import { logger } from './util.logger';
import { ts } from './util.ts';

type B = t.CompilerModelBuilder;

export async function loadConfig(
  file?: string,
  options: { name?: string; silent?: boolean } = {},
): Promise<B> {
  const done = (config: B) => filterOnVariant(config, options.name).clone();

  // Ensure configuration file exists.
  const path = await toPaths(file);

  // Log the configuration path being used.
  if (!options.silent) {
    const filename = fs.basename(path.ts);
    const ext = fs.extname(filename);
    const file = filename.substring(0, filename.length - ext.length);
    log.info.gray(`configuration:`);
    log.info.gray(`${fs.dirname(path.ts)}/${log.white(file)}${ext}`);
  }

  // Compare with the last built configuration.
  const buildhash = ts.buildhash(path.ts);
  if (!(await fs.pathExists(path.js)) || (await buildhash.changed())) {
    if (!options.silent) {
      log.info('building typescript');
    }

    await ts.build();
  }

  // Retrieve the configuration.
  const imported = require(path.js).default; // eslint-disable-line
  await buildhash.save();

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

const toPaths = async (input?: string) => {
  const PATH = DEFAULT.CONFIG.PATH;
  const FILENAME = fs.basename(PATH);

  let file = (typeof input === 'string' ? input : PATH).trim();
  file = file ? fs.resolve(file) : file;
  file = (await fs.is.dir(file)) ? fs.join(file, FILENAME) : file;
  file = file.trim().replace(/\.js$/, '').replace(/\.ts$/, '');
  if (!file) {
    logger.errorAndExit(1, `A path to the configuration file could not be derived.`);
  }

  file = file.substring(fs.resolve('.').length + 1);
  const js = fs.resolve(`lib/${file.substring(file.indexOf('/'))}.js`);

  let ts = fs.resolve(`${file}.ts`);
  ts = (await fs.pathExists(ts)) ? ts : fs.resolve(`${file}.tsx`);
  if (!(await fs.pathExists(ts))) {
    logger.errorAndExit(1, `The configuration file path does not exist ${log.white(ts)}`);
  }

  return { file, ts, js };
};

const filterOnVariant = (config: B, name?: string): B => {
  name = (name || '').trim();
  if (name && !config.find(name)) {
    const err = `A configuration named '${log.white(name)}' was not found.`;
    logger.errorAndExit(1, err);
  }
  return name ? (config.find(name) as B) : config;
};

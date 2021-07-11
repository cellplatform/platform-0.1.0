import { fs, log, t, ProgressSpinner } from '../common';
import { DEFAULT } from '../constants';
import { Logger } from './util.logger';
import { ts } from './util.ts';

type B = t.CompilerModelBuilder;

export async function loadConfig(
  file?: string,
  options: { name?: string; silent?: boolean } = {},
): Promise<B> {
  const { silent } = options;
  const spinner = ProgressSpinner({ label: 'building typescript...', silent });
  const done = (config: B) => {
    spinner.stop();
    return filterOnVariant(config, options.name).clone();
  };

  const { white, cyan } = log;

  // Ensure configuration file exists.
  const path = await toPaths(file);

  // Log the configuration path being used.
  if (!options.silent) {
    const filename = fs.basename(path.ts);
    const ext = fs.extname(filename);
    const file = filename.substring(0, filename.length - ext.length);

    const filenameColored = file
      .split('.')
      .map((n, i) => (i === 0 ? cyan(n) : n))
      .join('.');

    log.info.gray(`configuration:`);
    log.info.gray(`${fs.dirname(path.ts)}/${white(filenameColored)}${ext}`);
  }

  // Compare with the last built configuration.
  const buildhash = ts.buildhash(path.ts);
  if (!(await fs.pathExists(path.js)) || (await buildhash.changed())) {
    spinner.start();
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
      const err = `The default export did not return a configuration builder.\n${white(path)}`;
      Logger.errorAndExit(1, err);
    }
    return done(config);
  }

  // Exported {object}.
  if (typeof imported !== 'object' && typeof imported.clone !== 'function') {
    const err = `The default export was not a configuration builder.\n${white(path)}`;
    Logger.errorAndExit(1, err);
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
    Logger.errorAndExit(1, `A path to the configuration file could not be derived.`);
  }

  file = file.substring(fs.resolve('.').length + 1);
  const js = fs.resolve(`lib/${file.substring(file.indexOf('/'))}.js`);

  let ts = fs.resolve(`${file}.ts`);
  ts = (await fs.pathExists(ts)) ? ts : fs.resolve(`${file}.tsx`);
  if (!(await fs.pathExists(ts))) {
    Logger.errorAndExit(1, `The configuration file path does not exist ${log.white(ts)}`);
  }

  return { file, ts, js };
};

const filterOnVariant = (config: B, name?: string): B => {
  name = (name || '').trim();
  if (name && !config.find(name)) {
    const err = `A configuration named '${log.white(name)}' was not found.`;
    Logger.errorAndExit(1, err);
  }
  return name ? (config.find(name) as B) : config;
};

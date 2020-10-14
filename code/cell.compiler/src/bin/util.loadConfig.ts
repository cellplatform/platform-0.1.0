import { fs, log, t } from '../common';

type B = t.ConfigBuilderChain;

const DEFAULT = {
  FILENAME: 'compiler.config.js',
  PATH: 'lib/compiler.config.js',
};

export async function loadConfig(file?: string): Promise<B> {
  // Wrangle path.
  let path = (typeof file === 'string' ? file : DEFAULT.PATH).trim();
  path = path ? fs.resolve(path) : path;
  path = path.trim();

  // Ensure configuration file exists
  if (!path) {
    errorAndExit(1, `A path to the configuration file could not be derived.`);
  }
  if (await fs.is.dir(path)) {
    path = fs.join(path, DEFAULT.FILENAME);
    await ensureExists(path);
  }
  path = !path.endsWith('.js') ? `${path}.js` : path;
  await ensureExists(path);
  log.info.gray(path);

  // Retrieve the configuration.
  const imported = require(path).default; // eslint-disable-line

  // Run exported function.
  if (typeof imported === 'function') {
    const res = imported();
    const config = (res && typeof res.then === 'function' ? await res : res) as B;
    if (!config) {
      const err = `The default export did not return a configuration builder.\n${log.white(path)}`;
      errorAndExit(1, err);
    }
    return config;
  }

  // Exported {object}.
  if (typeof imported !== 'object' && typeof imported.clone !== 'function') {
    errorAndExit(1, `The default export was not a configuration builder.\n${log.white(path)}`);
  }

  return imported.clone() as B;
}

/**
 * [Helpers]
 */

const errorAndExit = (code: number, ...message: string[]) => {
  log.info();
  message.forEach((msg, i) => {
    msg = i === 0 ? `${log.red('FAILED')}\n${msg}` : msg;
    log.info.yellow(msg);
  });
  log.info();
  process.exit(code);
};

const ensureExists = async (path: string) => {
  if (!(await fs.pathExists(path))) {
    errorAndExit(1, `The configuration file path does not exist ${log.white(path)}`);
  }
};

import { fs, log, t } from '../common';

export async function loadConfig(file?: string) {
  const DEFAULT = 'lib/compiler.config.js';
  let path = (typeof file === 'string' ? file : DEFAULT).trim();
  path = path ? fs.resolve(path) : path;

  if (!path) {
    log.info();
    log.info.yellow(`FAILED: A path to the configuration file could not be derived.`);
    log.info();
    process.exit(1);
  }

  const fn = require(path).default; // eslint-disable-line
  if (typeof fn !== 'function') {
    log.info();
    log.info.yellow(`FAILED: A default function not found at\n${log.white(path)}`);
    log.info();
    process.exit(1);
  }

  const res = fn();
  const config = (res && typeof res.then === 'function' ? await res : res) as t.WebpackBuilder;
  if (!config) {
    log.info();
    log.info.yellow(`FAILED: The function did not configuration builder.\n${log.white(path)}`);
    log.info();
    process.exit(1);
  }

  return config.clone();
}

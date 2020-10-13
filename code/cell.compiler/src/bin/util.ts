import { t, log, minimist, fs } from '../common';

export * from './util.logger';

type P = minimist.ParsedArgs;

export function params(argv: P) {
  const params = {
    get mode(): string | undefined {
      return argv.mode || argv.m;
    },
    get port(): number | undefined {
      return argv.port || argv.p;
    },
    get config(): string | undefined {
      return argv.config || argv.c;
    },

    async loadConfig() {
      const DEFAULT = 'lib/compiler.config.js';
      const param = params.config;
      let path = (typeof param === 'string' ? param : DEFAULT).trim();
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
    },
  };

  return params;
}

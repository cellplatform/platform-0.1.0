import { minimist } from '../common';
import { loadConfig } from './util.loadConfig';

export * from './util.logger';
export * from './util.loadConfig';

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

    loadConfig() {
      return loadConfig(params.config);
    },
  };

  return params;
}

import { minimist, t } from '../common';
import { loadConfig } from './util.loadConfig';

type P = minimist.ParsedArgs;

export function params(argv: P) {
  const params = {
    get mode(): t.WpMode | undefined {
      return argv.mode || argv.m;
    },

    get url(): string | number | undefined {
      return argv.url;
    },

    get uri(): string | undefined {
      return argv.uri;
    },

    get config(): string | undefined {
      return argv.config || argv.c;
    },

    get host(): string | undefined {
      return argv.host || argv.h;
    },

    get dir(): string | undefined {
      return argv.dir;
    },

    loadConfig() {
      return loadConfig(params.config);
    },
  };

  return params;
}

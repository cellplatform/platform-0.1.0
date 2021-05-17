import { t } from './common';

const PARAMS = {
  COMMON: {
    // config: `(optional) Configuration file (default: "${DEFAULT.CONFIG.PATH}")`,
    name: `(optional) Named configuration to use`,
    mode: `(optional) 'production' of 'development' (or use --prod --dev)`,
  },
  BUMP: `(optional) Increment package.json version ("patch" (default), "minor", "major", "alpha", "beta")`,
};

export const COMMANDS: t.Commands = {
  prepare: {
    description: 'Prepare the electron "/app" package folder',
    params: {
      argument: 'mode: "make" or "dev" (default)',
      '--no-install': '(optional) Supress the "yarn install" process',
    },
  },
  // 'prepare-make': {
  //   description: 'Prepare the electron application package for the [make] operation',
  //   params: {},
  // },
};

import * as t from './types';

const PARAMS = {
  COMMON: {
    name: `(optional) Named of the thing`,
    mode: `(optional) 'production' of 'development' (or use --prod --dev)`,
  },
};

export const COMMANDS: t.Commands = {
  init: {
    description: 'Initialize new deployment configuration',
    params: {},
  },
  ls: {
    description: 'List deployment configurations',
    params: {},
  },
  deploy: {
    description: 'Deploy to cloud',
    params: {
      '--force': `Force a new deployment even if nothing has changed`,
      '--dry': `Dry run (prepares but will not deploy)`,
    },
  },
};

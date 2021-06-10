import * as t from './types';

const PARAMS = {
  COMMON: {
    name: `(optional) Named of the thing`,
    mode: `(optional) 'production' of 'development' (or use --prod --dev)`,
  },
};

export const COMMANDS: t.Commands = {
  verb: {
    description: 'Description of <verb> command',
    params: {
      '--name': PARAMS.COMMON.name,
      '--mode': PARAMS.COMMON.mode,
      '--force, -f': '(optional) Example with abbreviation',
    },
  },
};

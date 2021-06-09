import * as t from './types';

export const COMMANDS: t.Commands = {
  create: {
    description: 'Create from template',
    params: {
      '--install': `(optional) Flag indicating if [yarn install] should be run`,
    },
  },
  ls: {
    description: 'List available templates',
    params: {},
  },
};

import { t } from './common';

export const COMMANDS: t.Commands = {
  prepare: {
    description: 'Prepare the electron "/A1" (app) package folder',
    params: {
      argument: 'mode: "make" or "dev" (default)',
      '--no-install': '(optional) Suppress the "yarn install" process',
      '--force': '(optional) Alaways delete [node_modules] and force a fresh install',
    },
  },
};

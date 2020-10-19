import { t } from '../common';

const PARAMS = {
  config: `(optional) Path to configuration file (default: "lib/compiler.config.js)`,
  mode: `(optional) Override build mode ('prod' | 'dev')`, // TEMP 🐷
  name: `(optional) Named configuration to use (default: 'base')`,
};

export const COMMANDS: t.Commands = {
  bundle: {
    description: 'Compile the project into a bundle',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
    },
  },
  watch: {
    description: 'Bundle and watch for file changes',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
    },
  },
  dev: {
    description: 'Start development server (HMR)',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
    },
  },
  upload: {
    description: 'Bundle and upload to a cell',
    params: {
      '--host -h': `The target host domain`,
      '--uri': `The target cell URI (eg 'cell:<ns>:A1')`,
      '--config': PARAMS.config,
      '--dir': `(optional) The target directory within the cell`,
    },
  },
  info: {
    description: 'Information about a build configuration',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
    },
  },
  clean: {
    description: 'Remove transient build artifacts',
    params: {},
  },
};

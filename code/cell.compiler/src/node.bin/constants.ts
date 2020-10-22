import { t } from './common';

export const DEFAULT = {
  CONFIG: {
    PATH: 'src/compiler.config.ts',
  },
};

const PARAMS = {
  config: `(optional) Path to configuration file (default: "${DEFAULT.CONFIG.PATH}")`,
  name: `(optional) Named configuration to use`,
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
      '--uri': `The target cell URI (eg "cell:<ns>:A1")`,
      '--config': PARAMS.config,
      '--name': PARAMS.name,
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
    description: 'Delete transient build artifacts',
    params: {},
  },
};

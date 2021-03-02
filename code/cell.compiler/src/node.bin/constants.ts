import { t } from './common';

export const DEFAULT = {
  CONFIG: { PATH: 'src/compiler.config.ts' },
};

const PARAMS = {
  config: `(optional) Configuration file (default: "${DEFAULT.CONFIG.PATH}")`,
  name: `(optional) Named configuration to use`,
  mode: `(optional) 'production' of 'development' (or use --prod --dev)`,
};

export const COMMANDS: t.Commands = {
  bundle: {
    description: 'Compile the project into a bundle',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
      '--mode': PARAMS.mode,
      '--declarations, -d': '(optional) Declarations (".d.ts" files) only',
    },
  },
  watch: {
    description: 'Bundle and watch for file changes',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
      '--mode': PARAMS.mode,
    },
  },
  dev: {
    description: 'Start development server (HMR)',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
      '--mode': PARAMS.mode,
      '--no-exports': `(optional) Suppress module federation exports`,
      '--port': `(optional) Override the configured port`,
    },
  },
  upload: {
    description: 'Bundle and upload to a cell',
    params: {
      '--dir': `The target directory within the cell`,
      '--host': `The target host domain`,
      '--uri': `The target cell URI (eg "cell:<ns>:A1")`,
      '--config': PARAMS.config,
      '--name': PARAMS.name,
      '--no-bundle': `(optional) Skip bundling the project`,
      '--clean': `(optional) Clear cache before bundling`,
      '--mode': PARAMS.mode,
    },
  },
  info: {
    description: 'Information about a build configuration',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
    },
  },
  serve: {
    description: 'Simple HTTP static server (CORS)',
    params: {
      '--config': PARAMS.config,
      '--name': PARAMS.name,
      '--port': `(optional) Override the configured port`,
    },
  },
  clean: {
    description: 'Delete transient build artifacts',
    params: {},
  },
};

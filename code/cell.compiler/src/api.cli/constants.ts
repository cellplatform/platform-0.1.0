import { t } from './common';

export const DEFAULT = {
  CONFIG: { PATH: 'src/Compiler.config.ts' },
};

const PARAMS = {
  COMMON: {
    config: `(optional) Configuration file (default: "${DEFAULT.CONFIG.PATH}")`,
    name: `(optional) Named configuration to use`,
    mode: `(optional) 'production' of 'development' (or use --prod --dev)`,
  },
  BUMP: `(optional) Increment package.json version ("patch" (default), "minor", "major", "alpha", "beta")`,
};

export const COMMANDS: t.Commands = {
  bundle: {
    description: 'Compile the project into a bundle',
    params: {
      '--config': PARAMS.COMMON.config,
      '--name': PARAMS.COMMON.name,
      '--mode': PARAMS.COMMON.mode,
      '--declarations, -d': '(optional) Declarations (".d.ts" files) only',
      '--bump': PARAMS.BUMP,
    },
  },
  watch: {
    description: 'Bundle and watch for file changes',
    params: {
      '--config': PARAMS.COMMON.config,
      '--name': PARAMS.COMMON.name,
      '--mode': PARAMS.COMMON.mode,
    },
  },
  dev: {
    description: 'Start development server (HMR)',
    params: {
      '--config': PARAMS.COMMON.config,
      '--name': PARAMS.COMMON.name,
      '--mode': PARAMS.COMMON.mode,
      '--no-exports': `(optional) Suppress module federation exports`,
      '--port': `(optional) Override the configured port`,
    },
  },
  info: {
    description: 'Information about a build configuration',
    params: {
      '--config': PARAMS.COMMON.config,
      '--name': PARAMS.COMMON.name,
    },
  },
  serve: {
    description: 'Simple HTTP static server (CORS)',
    params: {
      '--config': PARAMS.COMMON.config,
      '--name': PARAMS.COMMON.name,
      '--port': `(optional) common.Override the configured port`,
    },
  },
  clean: {
    description: 'Delete transient build artifacts',
    params: {},
  },
};

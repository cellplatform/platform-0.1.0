import { t } from '../common';

const PARAMS = {
  config: `Path to configuration file (default: 'compiler.config')`,
  mode: `Override build mode.`,
};

export const COMMANDS: t.Commands = {
  bundle: {
    description: 'Compile the project into a bundle',
    params: {
      '--config': PARAMS.config,
      '--mode, -m': PARAMS.mode,
      '--port -p': `Port the bundle is federated on.`,
    },
  },
  watch: {
    description: 'Build and watch for file changes',
    params: {
      '--config': PARAMS.config,
      '--mode, -m': PARAMS.mode,
    },
  },
  dev: {
    description: 'Start development server (HMR)',
    params: {
      '--config': PARAMS.config,
      '--port -p': `Port to listen on.`,
    },
  },
  info: {
    description: 'Output info about the build',
    params: {
      '--config': PARAMS.config,
    },
  },
};

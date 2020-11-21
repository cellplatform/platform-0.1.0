import * as t from '../types';

export const NodeRuntime = {
  init() {
    const runtime: t.RuntimeEnvNode = {
      name: 'node',

      async exists(bundle) {
        return false;
      },

      async pull(bundle) {
        // TODO 🐷 
        // return false;
      },

      async run(args) {
        // TODO 🐷 
        // return false;
      },
    };

    return runtime;
  },
};

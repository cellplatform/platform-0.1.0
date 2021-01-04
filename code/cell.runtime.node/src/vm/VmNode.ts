import { t } from '../common';

import { NodeVM } from 'vm2';

type O = Record<string, unknown>;

/**
 * Secure JS virtual-machine.
 */
export const VmNode = {
  /**
   * Creates a new VM for running on Node.
   */
  create(options: { silent?: boolean; stdlibs?: t.AllowedStdlib[]; global?: O } = {}) {
    const { stdlibs, silent, global = {} } = options;
    return new NodeVM({
      console: silent ? 'off' : 'inherit',
      sandbox: global,
      wasm: true,
      require: {
        root: './',
        builtin: stdlibs,
        external: true,
      },
    });
  },
};

import { NodeVM } from 'vm2';

type O = Record<string, unknown>;

/**
 * Secure JS virtual-machine.
 */
export const VmNode = {
  /**
   * Creates a new VM for running on Node.
   */
  create(options: { silent?: boolean; builtin?: string[]; global?: O } = {}) {
    const { builtin = [], silent, global: sandbox = {} } = options;
    return new NodeVM({
      console: silent ? 'off' : 'inherit',
      sandbox,
      wasm: true,
      require: {
        root: './',
        builtin,
        external: true,
      },
    });
  },
};

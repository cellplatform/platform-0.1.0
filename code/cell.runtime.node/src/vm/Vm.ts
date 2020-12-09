import { NodeVM } from 'vm2';

type O = Record<string, unknown>;

/**
 * Secure JS virtual-machine.
 */
export const Vm = {
  /**
   * Creates a new VM for running on Node.
   */
  node(options: { silent?: boolean; builtin?: string[]; sandbox?: O } = {}) {
    const { builtin = [], silent, sandbox = {} } = options;
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

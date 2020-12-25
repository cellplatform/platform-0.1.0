import { VmNode } from './VmNode';
import { VmCode } from './VmCode';

/**
 * Secure JS virtual-machine.
 *
 * Ref:
 *    https://github.com/patriksimek/vm2
 *
 */
export const Vm = {
  /**
   * Create a new VM for running on Node.
   */
  node: VmNode.create,

  /**
   * Manager for compiled code scripts.
   */
  code: VmCode.get,
};

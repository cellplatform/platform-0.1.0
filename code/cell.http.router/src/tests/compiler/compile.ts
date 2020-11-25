import { Compiler } from '@platform/cell.compiler';
import node from './compiler.config.node';

/**
 * Helpers for compiling test bundles.
 */
export const compile = {
  async node() {
    const config = node();
    await Compiler.bundle(config);
  },
};

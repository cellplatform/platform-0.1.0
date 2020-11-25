import { Compiler } from '../..';
import node from './compiler.config.node';

/**
 * Helpers for compiling test bundles.
 */
export const TestCompile = {
  node: {
    config: node(),
    bundle: () => Compiler.bundle(TestCompile.node.config),
  },
};

import { t } from '../common';

/**
 * Global context for executing [node] code.
 */
export type NodeGlobal = { env: NodeGlobalEnv };

/**
 * The injected node environment context.
 */
export type NodeGlobalEnv = {
  /**
   * Entry context passed into a function when it is invoked.
   */
  entry: { params: t.Json };

  /**
   * Signals that a function has completed,
   * optionally returning a value.
   */
  done<T extends t.Json>(result?: T): void;
};

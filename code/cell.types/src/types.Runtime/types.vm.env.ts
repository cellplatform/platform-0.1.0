import { t } from '../common';

/**
 * Global context for executing [node] code.
 */
export type NodeGlobal = {
  env: NodeGlobalEnv;
};

/**
 * The injected node environment context.
 */
export type NodeGlobalEnv = {
  /**
   * Entry context passed into a function when it is invoked.
   */
  in: t.RuntimeIn;

  // TODO 🐷
  // in: { value; options };
  // out: { value };

  /**
   * Signals that a function has completed,
   * optionally returning a value.
   */
  done<T extends t.JsonMap>(result?: T): void;
};

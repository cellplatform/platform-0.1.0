import { t } from '../common';

/**
 * Global context for executing [node] code.
 */
export type Global = {
  env: GlobalEnv;
};

/**
 * The injected node environment context.
 */
export type GlobalEnv = {
  /**
   * Entry value (and meta-data) passed into a function when it is invoked.
   * NB: This may have been passed from the prior function within an execution pipeline.
   */
  in: t.RuntimeIn;

  /**
   * API for returning value/meta-data out of the function.
   */
  out: GlobalEnvOut;
};

export type GlobalEnvOut = {
  /**
   * Signals that a function has completed,
   * optionally returning a result value.
   */
  done<T extends t.JsonMap>(value?: T): void;

  /**
   * Set the content-type (mime-type) of the return value.
   * Default: "application/json"
   */
  contentType(mime: string): GlobalEnvOut;

  /**
   * Set the type-definition of the return value.
   */
  contentDef(uri: string): GlobalEnvOut;
};

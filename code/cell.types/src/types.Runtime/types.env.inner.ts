import { t } from '../common';

type Id = string;

/**
 * Global context for executing [node] code.
 */
export type Global = { env: GlobalEnv };

/**
 * The injected node environment context.
 */
export type GlobalEnv = {
  tx: Id; // The transaction ID of the environment instance.  Unique for each execution. Use to "kill" long running processes.
  bus: t.EventBus<any>;

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

export type GlobalEnvOut<J extends t.Json = t.Json> = {
  /**
   * Signals that a function has completed,
   * optionally returning a result value.
   */
  done<T extends t.Json = J>(value?: T): void;

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

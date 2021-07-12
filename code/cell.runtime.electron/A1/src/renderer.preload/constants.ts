export const IPC = {
  /**
   * Channel that event-bus messages are transmitted on.
   */
  CHANNEL: 'runtime/sys',
};

/**
 * Keys of values stored in [process.argv].
 */
export const PROCESS = {
  DEV: 'env:dev',
  RUNTIME: 'env:runtime',
  URI_SELF: 'env:uri:self',
};

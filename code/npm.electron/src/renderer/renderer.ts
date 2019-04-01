export * from '../types';
export * from '@platform/electron/lib/renderer';
import * as t from '../types';

/**
 * Initializes a new renderer DB/Network process.
 */
export function init(args: { ipc: t.IpcClient }) {
  const { ipc } = args;
  return {};
}

import { take } from 'rxjs/operators';
import { DbRenderer } from './DbRenderer';
import { IpcClient, DbFactory, IDb } from './types';

export * from '../types';
export * from './DbRenderer';
export { DbRenderer };

/**
 * Initialize the renderer.
 */
export function init(args: {
  ipc: IpcClient;
  onCreate?: (args: { conn: string; db: IDb }) => void;
}) {
  const { ipc } = args;
  const CACHE: { [conn: string]: DbRenderer } = {};

  /**
   * Retrieves a DB proxy at the given directory.
   */
  const factory: DbFactory = conn => {
    if (!CACHE[conn]) {
      const db = (CACHE[conn] = DbRenderer.create({ ipc, conn: conn }));
      db.dispose$.pipe(take(1)).subscribe(() => delete CACHE[conn]);
      if (args.onCreate) {
        args.onCreate({ conn: conn, db });
      }
    }
    return CACHE[conn];
  };

  return { factory };
}

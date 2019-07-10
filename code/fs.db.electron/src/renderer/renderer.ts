import { take } from 'rxjs/operators';
import { DbRenderer } from './DbRenderer';
import { IpcClient, DbFactory } from './types';

export * from '../types';
export * from './DbRenderer';
export { DbRenderer };

/**
 * Initialize the renderer
 */
export function init(args: { ipc: IpcClient }) {
  const CACHE: { [dir: string]: DbRenderer } = {};
  const { ipc } = args;

  /**
   * Retrieves a DB proxy at the given directory.
   */
  const db: DbFactory = dir => {
    if (!CACHE[dir]) {
      const db = (CACHE[dir] = DbRenderer.create({ ipc, dir }));
      db.dispose$.pipe(take(1)).subscribe(() => {
        delete CACHE[dir];
      });
    }
    return CACHE[dir];
  };

  return {  db };
}

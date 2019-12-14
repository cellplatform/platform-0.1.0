import { t } from '../common';
import * as cell from './cell.file';

/**
 * Routes for operating with cells.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  cell.init(args);
}

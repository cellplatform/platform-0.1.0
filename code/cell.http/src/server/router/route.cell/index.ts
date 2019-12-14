import { t } from '../common';
import * as coord from './cell.coord';
import * as file from './cell.file';

/**
 * Routes for operating with cells.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  coord.init(args);
  file.init(args);
}

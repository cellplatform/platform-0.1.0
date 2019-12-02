import { t } from '../common';
import * as file from './file';
import * as cell from './cell.file';

/**
 * Cell routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  file.init(args);
  cell.init(args);
}

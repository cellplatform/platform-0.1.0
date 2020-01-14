import { t } from '../common';
import * as file from './cell.file';
import * as files from './cell.files';

/**
 * Routes for operating with cells.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  file.init(args);
  files.init(args);
}

import { t } from '../common';
import * as filesDelete from './cell.files.delete';
import * as filesGet from './cell.files.get';
import * as filesUpload from './cell.files.upload';

/**
 * Cell routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  filesGet.init(args);
  filesDelete.init(args);
  filesUpload.init(args);
}

import { t } from '../common';
import * as file from './file';

export { postFileResponse, getFileDownloadResponse, deleteFileResponse } from './file';

/**
 * Routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  file.init(args);
}

import { t } from '../common';
import * as file from './file';

export { getFileInfoHandler as getFileInfoResponse } from './file.info';
export { getFileDownloadHandler as getFileDownloadResponse } from './file.download';
export { postFileUploadStartHandler } from './file.upload.start';
export { postFileUploadCompleteHandler } from './file.upload.complete';
export { deleteFileHandler as deleteFileResponse } from './file.delete';

/**
 * Routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  file.init(args);
}

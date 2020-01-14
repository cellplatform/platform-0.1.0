import { t } from '../common';
import * as file from './file';

export { getFileInfoHandler as getFileInfoResponse } from './handler.info';
export { getFileDownloadHandler as getFileDownloadResponse } from './handler.download';
export { postFileUploadStartHandler } from './handler.upload.start';
export { postFileUploadCompleteHandler } from './handler.upload.complete';
export { deleteFileHandler as deleteFileResponse } from './handler.delete';

/**
 * Routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  file.init(args);
}

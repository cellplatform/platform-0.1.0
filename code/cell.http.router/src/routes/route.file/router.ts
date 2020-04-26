import { routes, t } from '../common';
import { downloadBinaryFile } from './handler.download.binary';
import { fileInfo } from './handler.info';
import { uploadLocalFile } from './handler.upload.local';
import { uploadFileComplete } from './handler.upload.complete';
import { getParams } from './params';

/**
 * File-system routes (fs:).
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  /**
   * GET (file info/meta).
   */
  router.get(routes.FILE.INFO, async req => {
    const host = req.host;
    const query = req.query as t.IReqQueryFileInfo;
    const params = req.params as t.IUrlParamsFile;
    const { status, ns, error, fileUri } = getParams(params);
    return !ns || error ? { status, data: { error } } : fileInfo({ fileUri, db, host });
  });

  /**
   * GET (file download).
   */
  router.get(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IReqQueryFileDownload;
    const params = req.params as t.IUrlParamsFile;
    const { status, ns, error, fileUri } = getParams(params);
    const matchHash = query.hash;

    return !ns || error
      ? { status, data: { error } }
      : downloadBinaryFile({ db, fs, fileUri, host, matchHash });
  });

  /**
   * POST (file upload complete)
   */
  router.post(routes.FILE.UPLOADED, async req => {
    const host = req.host;
    const query = req.query as t.IReqQueryFileUploadComplete;
    const body = await req.body.json<t.IReqPostFileUploadCompleteBody>();
    const params = req.params as t.IUrlParamsFile;
    const { status, ns, error, fileUri } = getParams(params);
    const sendChanges = query.changes;
    return !ns || error
      ? { status, data: { error } }
      : uploadFileComplete({ db, fs, fileUri, host, sendChanges });
  });

  /**
   * POST (local file upload)
   */
  router.post(routes.LOCAL.FS, async req => {
    const query = req.query as t.IReqQueryLocalFs;
    const path = (req.headers.path || '').toString().trim();
    const data = await req.body.buffer({ limit: '1gb' });
    return uploadLocalFile({ db, fs, path, data, query });
  });
}

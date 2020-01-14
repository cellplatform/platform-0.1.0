import { routes, t } from '../common';
import { deleteFile } from './handler.delete';
import { downloadFile } from './handler.download';
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
    const query = req.query as t.IUrlQueryFileInfo;
    const params = req.params as t.IUrlParamsFile;
    const { status, ns, error, uri } = getParams(params);
    return !ns || error ? { status, data: { error } } : fileInfo({ uri, db, query, host });
  });

  /**
   * GET (file download).
   */
  router.get(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileDownload;
    const params = req.params as t.IUrlParamsFile;
    const { status, ns, error, uri } = getParams(params);
    return !ns || error ? { status, data: { error } } : downloadFile({ db, fs, uri, host, query });
  });

  /**
   * POST (file verify)
   */
  router.post(routes.FILE.VERIFIED, async req => {
    /**
     * TODO 🐷
     * - rename URL to:    /<file-uri>/upload/complete
     *
     *
     *
     *                      /<file-uri>/upload/start
     *                      /<file-uri>/upload/complete
     */

    const host = req.host;
    const query = req.query as t.IUrlQueryFileVerified;
    const body = await req.body.json<t.IReqPostFileVerifiedBody>({ default: { overwrite: false } });
    const params = req.params as t.IUrlParamsFile;
    const { status, ns, error, uri } = getParams(params);
    const { overwrite } = body;
    return !ns || error
      ? { status, data: { error } }
      : uploadFileComplete({ db, fs, uri, host, query, overwrite });
  });

  /**
   * POST (local file upload)
   */
  router.post(routes.LOCAL.FS, async req => {
    const query = req.query as t.IUrlQueryLocalFs;
    const path = (req.headers.path || '').toString().trim();
    const data = await req.body.buffer();
    return uploadLocalFile({ db, fs, path, data, query });
  });

  /**
   * DELETE binary-file.
   */
  router.delete(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileDelete;
    const params = req.params as t.IUrlParamsFile;
    const { status, ns, error, uri } = getParams(params);
    return !ns || error ? { status, data: { error } } : deleteFile({ fs, uri, db, host });
  });
}

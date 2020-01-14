import { constants, routes, Schema, t } from '../common';
import { deleteFileHandler } from './handler.delete';
import { getFileDownloadHandler } from './handler.download';
import { getFileInfoHandler } from './handler.info';
import { fileUploadLocalHandler } from './handler.local';
import { fileUploadCompleteHandler } from './handler.upload.complete';

/**
 * File-system routes (fs:).
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  const getParams = (req: t.Request) => {
    const params = req.params as t.IUrlParamsFile;
    const data = {
      ns: (params.ns || '').toString(),
      file: (params.file || '').toString(),
      uri: '',
    };

    const error: t.IError = {
      type: constants.ERROR.HTTP.MALFORMED_URI,
      message: '',
    };

    const toMessage = (msg: string) => `Malformed "file:" URI, ${msg} ("${req.url}").`;

    if (!data.ns) {
      error.message = toMessage('does not contain a namespace-identifier');
      return { ...data, status: 400, error };
    }

    if (!data.file) {
      error.message = toMessage('does not contain a file-identifier');
      return { ...data, status: 400, error };
    }

    try {
      data.uri = Schema.uri.create.file(data.ns, data.file);
    } catch (err) {
      error.message = toMessage(err.message);
      return { ...data, status: 400, error };
    }

    return { ...data, status: 200, error: undefined };
  };

  /**
   * GET (file info/meta).
   */
  router.get(routes.FILE.INFO, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileInfo;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error
      ? { status, data: { error } }
      : getFileInfoHandler({ uri, db, query, host });
  });

  /**
   * GET (file download).
   */
  router.get(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileDownload;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error
      ? { status, data: { error } }
      : getFileDownloadHandler({ db, fs, uri, host, query });
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
    const { status, ns, error, uri } = getParams(req);
    const { overwrite } = body;
    return !ns || error
      ? { status, data: { error } }
      : fileUploadCompleteHandler({ db, fs, uri, host, query, overwrite });
  });

  /**
   * POST (local file upload)
   */
  router.post(routes.LOCAL.FS, async req => {
    const query = req.query as t.IUrlQueryLocalFs;
    const path = (req.headers.path || '').toString().trim();
    const data = await req.body.buffer();
    return fileUploadLocalHandler({ db, fs, path, data, query });
  });

  /**
   * DELETE binary-file.
   */
  router.delete(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileDelete;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error ? { status, data: { error } } : deleteFileHandler({ fs, uri, db, host });
  });
}

import { routes, t, util } from '../common';
import { downloadFileByName } from './handler.download.byName';
import { downloadFileByFileId } from './handler.download.byFileId';
import { getFilenameParams, getFileUriParams } from './params';

/**
 * Routes for operating on a single cell file.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  /**
   * GET: File by name (download).
   *
   *      Example: /cell:foo:A1/file/kitten.jpg
   *      NB: This is the same as calling the `/file:...` GET route point directly.
   *
   */
  router.get(routes.CELL.FILE.BY_NAME, async req => {
    try {
      const host = req.host;
      const query = req.query as t.IReqQueryCellFileDownloadByName;
      const params = req.params as t.IUrlParamsCellFileByName;
      const paramData = getFilenameParams({ params });
      const { status, filename, error, cellUri } = paramData;
      const { hash: matchHash, expires } = query;

      return !paramData.ns || error
        ? { status, data: { error } }
        : downloadFileByName({ db, fs, cellUri, filename, host, matchHash, expires });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * GET: File by FileUri (download).
   *
   *      Example: /cell:foo:A1/file:abc123
   *               /cell:foo:A1/file:abc123.pdf
   *
   */
  router.get(routes.CELL.FILE.BY_FILE_URI, async req => {
    try {
      const host = req.host;
      const query = req.query as t.IReqQueryCellFileDownloadByFileUri;
      const params = req.params as t.IUrlParamsCellFileByName;
      const paramData = getFileUriParams({ params });
      const { status, filename, error, cellUri } = paramData;
      const { hash: matchHash, expires } = query;

      return !paramData.ns || error
        ? { status, data: { error } }
        : downloadFileByFileId({ db, fs, cellUri, filename, host, matchHash, expires });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}

import { routes, t, util } from '../common';
import { downloadFileByName } from './handler.download.byName';
import { getParams } from './params';

/**
 * Routes for operating on a single cell file.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  /**
   * GET: File by name (download).
   *      Example: /cell:foo!A1/file/kitten.jpg
   *      NB: This is the same as calling the `/file:...` GET route point directly.
   */
  router.get(routes.CELL.FILE_BY_NAME, async req => {
    try {
      const host = req.host;
      const query = req.query as t.IUrlQueryCellFileDownloadByName;
      const params = req.params as t.IUrlParamsCellFileByName;
      const paramData = getParams({ params, filenameRequired: true });
      const { status, filename, error, cellUri } = paramData;
      const { hash: matchHash, expires } = query;

      return !paramData.ns || error
        ? { status, data: { error } }
        : downloadFileByName({ db, fs, cellUri, filename, host, matchHash, expires });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}

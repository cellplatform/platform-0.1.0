import { t, routes } from '../common';
// import * as filesDelete from './cell.files.delete';
// import * as filesGet from './cell.files.get';
import * as filesUpload from './cell.files.upload';

import { getParams } from './params';

import { deleteCellFilesHandler } from './handler.delete';
import { listCellFilesHandler } from './handler.list';

/**
 * Routes for operating on a set of cell files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  // filesGet.init(args);
  // filesDelete.init(args);
  filesUpload.init(args);

  /**
   * GET: !A1/files
   */
  router.get(routes.CELL.FILES, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryCellFilesList;
    const params = req.params as t.IUrlParamsCellFiles;
    const paramData = getParams({ params });
    const { status, error, uri: cellUri } = paramData;
    return !paramData.ns || error
      ? { status, data: { error } }
      : listCellFilesHandler({ db, fs, cellUri, host });
  });

  /**
   * DELETE file(s) from a cell.
   */
  router.delete(routes.CELL.FILES, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryCellFilesDelete;
    const params = req.params as t.IUrlParamsCellFiles;
    const paramData = getParams({ params });
    const body = (await req.body.json()) as t.IReqDeleteCellFilesBody;
    const { status, error, uri: cellUri } = paramData;
    return !paramData.ns || error
      ? { status, data: { error } }
      : deleteCellFilesHandler({ db, fs, cellUri, body, host });
  });
}

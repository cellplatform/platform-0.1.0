import { t, routes, util } from '../common';

import { getParams } from './params';

import { deleteCellFiles } from './handler.delete';
import { listCellFiles } from './handler.list';
import { uploadCellFilesStart } from './handler.upload';

/**
 * Routes for operating on a set of cell files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  /**
   * GET: !A1/files
   */
  router.get(routes.CELL.FILES, async req => {
    try {
      const host = req.host;
      const query = req.query as t.IUrlQueryCellFilesList;
      const params = req.params as t.IUrlParamsCellFiles;
      const paramData = getParams({ params });
      const { status, error, cellUri } = paramData;

      return !paramData.ns || error
        ? { status, data: { error } }
        : listCellFiles({ db, fs, cellUri, host });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * POST start upload.
   *
   *      Initiate a file(s) upload, creating the model and
   *      returning pre-signed S3 url(s) to upload to.
   *      Usage:
   *        1. Invoke this POST to initiate the upload (save model).
   *        2. Invoke [file/uploadStart] handler for each file.
   *        3. Upload to the pre-signed S3 url(s) given by the file/uploadStart.
   *        4. POST to [/file/upload/completed] for each uploaded file to flesh out meta-data and verify.
   */
  router.post(routes.CELL.FILES, async req => {
    try {
      const host = req.host;
      const query = req.query as t.IUrlQueryCellFilesListUpload;
      const params = req.params as t.IUrlParamsCellFiles;
      const paramData = getParams({ params });
      const { status, error, cellUri } = paramData;
      const changes = query.changes;
      const body = ((await req.body.json()) || {}) as t.IReqPostCellUploadFilesBody;

      return !paramData.ns || error
        ? { status, data: { error } }
        : uploadCellFilesStart({ db, fs, cellUri, body, host, changes });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * DELETE file(s) from a cell.
   */
  router.delete(routes.CELL.FILES, async req => {
    try {
      const host = req.host;
      const query = req.query as t.IUrlQueryCellFilesDelete;
      const params = req.params as t.IUrlParamsCellFiles;
      const paramData = getParams({ params });
      const body = (await req.body.json()) as t.IReqDeleteCellFilesBody;
      const { status, error, cellUri: cellUri } = paramData;

      return !paramData.ns || error
        ? { status, data: { error } }
        : deleteCellFiles({ db, fs, cellUri, body, host });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}

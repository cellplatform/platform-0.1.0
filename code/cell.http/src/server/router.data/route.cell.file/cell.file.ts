import { models, routes, Schema, t, util } from '../common';
import { getFileDownloadResponse } from '../route.file';
import { getParams } from './cell.files.params';

/**
 * Cell routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  /**
   * GET: File by name (download).
   *      Example: /cell:foo!A1/file/kitten.jpg
   *      NB: This is the same as calling the `/file:...` GET route point directly.
   */
  router.get(routes.CELL.FILE_BY_NAME, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryCellFileByName;
    const params = req.params as t.IUrlParamsCellFileByName;

    const paramData = getParams({ params, filenameRequired: true });
    const { status, ns, key, filename, error, uri: cellUri } = paramData;
    if (!ns || error) {
      return { status, data: { error } };
    }

    try {
      // Retreive the [cell] info.
      const cell = await models.Cell.create({ db, uri: cellUri }).ready;
      const cellLinks = cell.props.links || {};
      const linkKey = Schema.file.links.toKey(filename);
      const fileUri = cellLinks[linkKey];

      // 404 if file URI not found.
      if (!fileUri) {
        const err = `The file '${filename}' is not associated with the cell "${cellUri}".`;
        return util.toErrorPayload(err, { status: 404 });
      }

      // Run the "file:" download handler.
      return getFileDownloadResponse({ db, fs, uri: fileUri, query, host });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * GET  File by index (download).
   *      Example: /cell:foo!A1/files/0
   */
  router.get(routes.CELL.FILE_BY_INDEX, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryCellFileByIndex;
    const params = req.params as t.IUrlParamsCellFileByIndex;

    const paramData = getParams({ params, indexRequired: true });
    const { status, ns, index, error, uri: cellUri } = paramData;
    if (!ns || error) {
      return { status, data: { error } };
    }

    try {
      // Retreive the [cell] info.
      const cell = await models.Cell.create({ db, uri: cellUri }).ready;
      const cellLinks = cell.props.links || {};
      const fileUri = cellLinks[Object.keys(cellLinks)[index]];

      // 404 if file URI not found.
      if (!fileUri) {
        const err = `A file at index [${index}] does not exist within the cell "${cellUri}".`;
        return util.toErrorPayload(err, { status: 404 });
      }

      // Run the "file:" download handler.
      return getFileDownloadResponse({ db, fs, uri: fileUri, query, host });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}

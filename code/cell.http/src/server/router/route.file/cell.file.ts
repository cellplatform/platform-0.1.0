import { defaultValue, constants, ROUTES, Schema, t, models, util } from '../common';
import { postFileResponse, getFileDownloadResponse } from './file';
import { postNsResponse } from '../route.ns';

/**
 * Cell routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  const getParams = (req: t.Request, options: { fileRequired?: boolean } = {}) => {
    const params = req.params as t.IReqCellFileParams;

    const data = {
      ns: (params.ns || '').toString().trim(),
      key: (params.key || '').toString().trim(),
      filename: (params.filename || '').toString().trim(),
      uri: '',
    };

    const error: t.IError = {
      type: constants.ERROR.MALFORMED_URI,
      message: '',
    };

    const toMessage = (msg: string) => `Malformed URI, ${msg} ("${req.url}").`;

    if (!data.ns) {
      error.message = toMessage('does not contain a namespace-identifier');
      return { ...data, status: 400, error };
    }

    if (!data.key) {
      error.message = toMessage('does not contain a cell key (eg A1)');
      return { ...data, status: 400, error };
    }

    if (!data.filename && options.fileRequired !== false) {
      error.message = toMessage('does not contain a filename');
      return { ...data, status: 400, error };
    }

    try {
      data.uri = Schema.uri.create.cell(data.ns, data.key);
    } catch (err) {
      error.message = toMessage(err.message);
      return { ...data, status: 400, error };
    }

    return { ...data, status: 200, error: undefined };
  };

  /**
   * GET: !A1/files
   */
  router.get(ROUTES.CELL.FILES, async req => {
    const host = req.host;
    const query = req.query as t.IReqCellFilesQuery;
    const { status, ns, error, uri } = getParams(req, { fileRequired: false });
    if (!ns || error) {
      return { status, data: { error } };
    }

    const cell = await models.Cell.create({ db, uri }).ready;
    const files = util.url(req.host).cellFilesList(cell.props.links || {});

    const links = util.url(req.host).cellFilesLinks(uri, cell.props.links || {});

    const data: t.IResGetCellFiles = {
      uri,
      cell: util.url(host).cell(uri),
      links,
      files,
    };

    return { status: 200, data };
  });

  /**
   * GET: Get a file by name (download)
   *      Example: /cell:foo!A1/files/kitten.jpg
   *      NB: This is the same as calling the `/file:...` GET route point directly.
   */

  router.get(ROUTES.CELL.FILE_BY_NAME, async req => {
    const host = req.host;
    const query = req.query as t.IReqFileDownloadQuery;
    const { status, ns, key, filename, error, uri: cellUri } = getParams(req);
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
   * POST a file to a cell
   */
  router.post(ROUTES.CELL.FILE_BY_NAME, async req => {
    const host = req.host;
    const query = req.query as t.IReqPostCellFileQuery;
    const { status, ns, key, filename, error, uri: cellUri } = getParams(req);
    if (!ns || error) {
      return { status, data: { error } };
    }

    try {
      // Prepare the file URI link.
      const cell = await models.Cell.create({ db, uri: cellUri }).ready;
      const cellLinks = cell.props.links || {};
      const linkKey = Schema.file.links.toKey(filename);
      const fileUri = cellLinks[linkKey] || Schema.uri.create.file(ns, Schema.slug());

      // Save to the file-system.
      const form = await req.body.form();
      const fsResponse = await postFileResponse({
        db,
        fs,
        uri: fileUri,
        form,
        query: { changes: true },
        host,
      });
      if (!util.isOK(fsResponse.status)) {
        const error = fsResponse.data as t.IHttpError;
        const msg = `Failed while writing file to cell [${key}]. ${error.message}`;
        return util.toErrorPayload(msg, { status: error.status });
      }
      const fsResponseData = fsResponse.data as t.IResPostFile;

      // Update the [Cell] model with the file URI link.
      // NB: This is done through the master [Namespace] POST
      //     handler as this ensures all hashes are updated.
      const nsResponse = await postNsResponse({
        db,
        id: ns,
        body: {
          cells: { [key]: { links: { ...cellLinks, [linkKey]: fileUri } } },
        },
        query: { cells: key, changes: true },
        host,
      });
      if (!util.isOK(nsResponse.status)) {
        const error = nsResponse.data as t.IHttpError;
        const msg = `Failed while updating cell [${key}] after writing file. ${error.message}`;
        return util.toErrorPayload(msg, { status: error.status });
      }
      const nsResponseData = nsResponse.data as t.IResPostNs;

      // Prepare response.
      await cell.load({ force: true });
      let changes: t.IDbModelChange[] | undefined;
      if (defaultValue(query.changes, true)) {
        changes = [...(nsResponseData.changes || []), ...(fsResponseData.changes || [])];
      }

      const links: t.IResPostCellLinks = { ...util.url(host).cellLinks(cellUri) };
      const res: t.IResPostCellFile = {
        uri: cellUri,
        createdAt: cell.createdAt,
        modifiedAt: cell.modifiedAt,
        exists: Boolean(cell.exists),
        data: {
          cell: cell.toObject(),
          changes,
        },
        links,
      };

      return { status: 200, data: res };
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}

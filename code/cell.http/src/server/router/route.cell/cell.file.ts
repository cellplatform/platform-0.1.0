import { defaultValue, constants, routes, Schema, t, models, util } from '../common';
import { postFileResponse, getFileDownloadResponse } from '../route.file';
import { postNsResponse } from '../route.ns';

type ParamOr = t.IUrlParamsCellFiles | t.IUrlParamsCellFileByName | t.IUrlParamsCellFileByIndex;
type ParamAnd = t.IUrlParamsCellFiles & t.IUrlParamsCellFileByName & t.IUrlParamsCellFileByIndex;

/**
 * Cell routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  const getParams = (args: {
    params: ParamOr;
    filenameRequired?: boolean;
    indexRequired?: boolean;
  }) => {
    const params = args.params as ParamAnd;
    const toString = (input?: any) => (input || '').toString().trim();

    const data = {
      ns: toString(params.ns || ''),
      key: toString(params.key || ''),
      filename: toString(params.filename || ''),
      index: defaultValue<number>(params.index as number, -1),
      uri: '',
    };

    const error: t.IError = {
      type: constants.ERROR.HTTP.MALFORMED_URI,
      message: '',
    };

    const toMessage = (msg: string) => `Malformed URI, ${msg}.`;

    if (!data.ns) {
      error.message = toMessage('does not contain a namespace-identifier');
      return { ...data, status: 400, error };
    }

    if (!data.key) {
      error.message = toMessage('does not contain a cell key (eg A1)');
      return { ...data, status: 400, error };
    }

    if (!data.filename && args.filenameRequired) {
      error.message = toMessage('does not contain a filename');
      return { ...data, status: 400, error };
    }

    if (data.index < 0 && args.indexRequired) {
      error.message = toMessage('does not contain a file index');
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
  router.get(routes.CELL.FILES, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryGetCellFiles;
    const params = req.params as t.IUrlParamsCellFiles;

    const paramData = getParams({ params });
    const { status, error } = paramData;

    if (!paramData.ns || error) {
      return { status, data: { error } };
    }

    // Prepare URIs.
    const cellUri = Schema.uri.parse<t.ICellUri>(paramData.uri);
    const nsUri = Schema.uri.parse<t.INsUri>(Schema.uri.create.ns(paramData.ns));

    // Retrieve data.
    const cell = await models.Cell.create({ db, uri: cellUri.toString() }).ready;
    const ns = await models.Ns.create({ db, uri: nsUri.toString() }).ready;

    // Construct links object.
    const urlBuilder = util.urls(req.host).cell(cellUri.toString());
    const cellLinks = cell.props.links || {};
    const links = urlBuilder.files.links(cellLinks);
    const linkUris = Object.keys(cellLinks)
      .map(key => cellLinks[key])
      .map(value => Schema.file.links.parseLink(value));
    const linkExists = (fileid: string) => {
      const fileUri = Schema.uri.create.file(nsUri.parts.id, fileid);
      return linkUris.some(item => item.uri === fileUri);
    };

    // Prepare files map.
    const files = { ...(await models.ns.getChildFiles({ model: ns })) };
    Object.keys(files).forEach(fileid => {
      if (!linkExists(fileid)) {
        delete files[fileid]; // NB: Trim off files that are not referenced by this cell.
      }
    });

    // Response.
    const data: t.IResGetCellFiles = {
      uri: cellUri.toString(),
      cell: urlBuilder.info,
      links,
      files,
    };

    return { status: 200, data };
  });

  /**
   * GET: File by name (download).
   *      Example: /cell:foo!A1/file/kitten.jpg
   *      NB: This is the same as calling the `/file:...` GET route point directly.
   */
  router.get(routes.CELL.FILE_BY_NAME, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryGetCellFileByName;
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
    const query = req.query as t.IUrlQueryGetCellFileByIndex;
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

  /**
   * POST a file to a cell.
   */
  router.post(routes.CELL.FILE_BY_NAME, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryPostFile;
    const params = req.params as t.IUrlParamsCellFileByName;

    const paramData = getParams({ params });
    const { status, ns, key, filename, error, uri: cellUri } = paramData;
    if (!ns || error) {
      return { status, data: { error } };
    }

    try {
      // Prepare the file URI link.
      const cell = await models.Cell.create({ db, uri: cellUri }).ready;
      const cellLinks = cell.props.links || {};
      const fileLinkKey = Schema.file.links.toKey(filename);
      const fileUri = cellLinks[fileLinkKey]
        ? cellLinks[fileLinkKey].split('?')[0]
        : Schema.uri.create.file(ns, Schema.slug());

      // Save to the file-system.
      const form = await req.body.form();
      const fsResponse = await postFileResponse({
        host,
        db,
        fs,
        uri: fileUri,
        form,
        query: { changes: true },
        filename,
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
      const fileLinkValue = `${fileUri}?hash=${fsResponseData.data.hash}`;
      const nsResponse = await postNsResponse({
        db,
        id: ns,
        body: {
          cells: {
            [key]: { links: { ...cellLinks, [fileLinkKey]: fileLinkValue } },
          },
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

      const urls = util.urls(host).cell(cellUri);
      const links: t.IResPostCellLinks = { ...urls.links };
      const res: t.IResPostCellFile = {
        uri: cellUri,
        createdAt: cell.createdAt,
        modifiedAt: cell.modifiedAt,
        exists: Boolean(cell.exists),
        data: { cell: cell.toObject(), changes },
        links,
      };

      return { status: 200, data: res };
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}

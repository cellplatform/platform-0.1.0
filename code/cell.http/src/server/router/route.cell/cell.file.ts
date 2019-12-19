import { constants, defaultValue, models, routes, Schema, t, util } from '../common';
import { getFileDownloadResponse, postFileResponse, deleteFileResponse } from '../route.file';
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
   * POST upload file(s) to a cell.
   */
  router.post(routes.CELL.FILES, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryUploadCellFiles;
    const params = req.params as t.IUrlParamsCellFiles;

    const paramData = getParams({ params });
    const { status, error, ns, uri: cellUri, key: cellKey } = paramData;

    if (!paramData.ns || error) {
      return { status, data: { error } };
    }

    // Read in the form.
    const form = await req.body.form();
    if (form.files.length === 0) {
      const err = new Error(`No file data was posted to the URI ("${cellUri}").`);
      return util.toErrorPayload(err, { status: 400 });
    }

    const postFile = async (args: { ns: string; file: t.IFormFile; links: t.IUriMap }) => {
      const { ns, file, links = {} } = args;
      const filename = file.name;
      const key = Schema.file.links.toKey(filename);
      const uri = links[key] ? links[key].split('?')[0] : Schema.uri.create.file(ns, Schema.slug());
      const query = { changes: true };
      const res = await postFileResponse({ host, db, fs, uri, file, query });
      const json = res.data as t.IResPostFile;
      const status = res.status;
      return { status, res, key, uri, filename, json };
    };

    try {
      // Prepare the file URI link.
      const cell = await models.Cell.create({ db, uri: cellUri }).ready;
      const cellLinks = cell.props.links || {};

      // Post each file to the file-system.
      const wait = form.files.map(file => postFile({ ns, file, links: cellLinks }));
      const postFilesRes = await Promise.all(wait);

      // Check for file-save errors.
      const errors: t.IResPostCellFilesError[] = [];
      postFilesRes
        .filter(item => !util.isOK(item.status))
        .forEach(item => {
          const { status, filename } = item;
          const data: any = item.res.data || {};
          const message = data.message || `Failed while writing '${filename}'`;
          errors.push({ status, filename, message });
        });

      // Update the [Cell] model with the file URI link(s).
      // NB: This is done through the master [Namespace] POST
      //     handler as this ensures all hashes are updated.
      const links = postFilesRes.reduce((links, next) => {
        if (util.isOK(next.status)) {
          const { key, uri } = next;
          links[key] = `${uri}?hash=${next.json.data.hash}`;
        }
        return links;
      }, cellLinks);

      const postNsRes = await postNsResponse({
        db,
        id: ns,
        body: { cells: { [cellKey]: { links } } },
        query: { cells: cellKey, changes: true },
        host,
      });

      if (!util.isOK(postNsRes.status)) {
        const error = postNsRes.data as t.IHttpError;
        const msg = `Failed while updating cell [${cellKey}] after writing file. ${error.message}`;
        return util.toErrorPayload(msg, { status: error.status });
      }
      const postNsData = postNsRes.data as t.IResPostNs;

      // Build change list.
      let changes: t.IDbModelChange[] | undefined;
      if (defaultValue(query.changes, true)) {
        changes = [...(postNsData.changes || [])];
        postFilesRes.forEach(item => {
          changes = [...(changes || []), ...(item.json.changes || [])];
        });
      }

      // Prepare response.
      await cell.load({ force: true });
      const urls = util.urls(host).cell(cellUri);
      const res: t.IResPostCellFiles = {
        uri: cellUri,
        createdAt: cell.createdAt,
        modifiedAt: cell.modifiedAt,
        exists: Boolean(cell.exists),
        data: { cell: cell.toObject(), errors, changes },
        links: { ...urls.links },
      };

      return { status: 200, data: res };
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * DELETE file(s) from a cell.
   */
  router.delete(routes.CELL.FILES, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryDeleteCellFiles;
    const params = req.params as t.IUrlParamsCellFiles;

    const paramData = getParams({ params });
    const { status, error, ns, uri: cellUri, key: cellKey } = paramData;
    if (!paramData.ns || error) {
      return { status, data: { error } };
    }

    try {
      // Extract values from request body.
      const body = (await req.body.json()) as t.IReqDeleteCellFilesBody;
      const action = body.action;
      const filenames = (body.filenames || [])
        .map(text => (text || '').trim())
        .filter(text => Boolean(text));

      const data: t.IResDeleteCellFilesData = {
        uri: cellUri,
        deleted: [],
        unlinked: [],
        errors: [],
      };

      const error = (error: 'DELETING' | 'UNLINKING' | 'NOT_LINKED', filename: string) => {
        data.errors = [...data.errors, { error, filename }];
      };

      const done = () => {
        const status = data.errors.length === 0 ? 200 : 500;
        return { status, data };
      };

      // Exit if there are no files to operate on.
      if (filenames.length === 0) {
        return done();
      }

      // Retrieve the [Cell] model.
      const cell = await models.Cell.create({ db, uri: cellUri }).ready;
      if (!cell.exists) {
        const msg = `The cell [${cellUri}] does not exist.`;
        return util.toErrorPayload(msg, { status: 404 });
      }

      // Parse file-names into usable link details.
      const links = cell.props.links || {};
      const items = filenames.map(filename => {
        const key = Schema.file.links.toKey(filename);
        const value = links[key];
        const parts = value ? Schema.file.links.parseLink(value) : undefined;
        const uri = parts ? parts.uri : '';
        const hash = parts ? parts.hash : '';
        return { filename, key, uri, hash, exists: Boolean(value) };
      });

      // Report any requested filenames that are not linked to the cell.
      items
        .filter(({ uri }) => !Boolean(uri))
        .forEach(({ filename }) => error('NOT_LINKED', filename));

      const deleteFile = async (filename: string, uri: string) => {
        const res = await deleteFileResponse({ db, fs, uri, host });
        if (util.isOK(res.status)) {
          data.deleted = [...data.deleted, filename];
        } else {
          error('DELETING', filename);
        }
      };

      const deleteFiles = async () => {
        const wait = items
          .filter(({ uri }) => Boolean(uri))
          .map(async ({ uri, filename }) => deleteFile(filename, uri));
        await Promise.all(wait);
      };

      const unlinkFiles = async () => {
        try {
          const after = { ...links };
          items
            .filter(({ uri }) => Boolean(uri))
            .forEach(({ key, filename }) => {
              delete after[key];
              data.unlinked = [...data.unlinked, filename];
            });
          await cell.set({ links: after }).save();
        } catch (error) {
          items
            .filter(({ uri }) => Boolean(uri))
            .forEach(({ filename }) => error('UNLINKING', filename));
        }
      };

      // Perform requested actions.
      switch (action) {
        case 'DELETE':
          await deleteFiles();
          await unlinkFiles();
          return done();
        case 'UNLINK':
          await unlinkFiles();
          return done();
        default:
          const invalidAction = action || '<empty>';
          const msg = `A valid action (DELETE | UNLINK) was not provided in the body, given:${invalidAction}.`;
          return util.toErrorPayload(msg, { status: 400 });
      }
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });
}

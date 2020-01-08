import { defaultValue, constants, routes, Schema, t, models, util, ERROR } from '../common';

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
   * GET (file-info).
   */
  router.get(routes.FILE.INFO, async req => {
    const host = req.host;
    const query = req.query as t.IReqFileInfoQuery;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error
      ? { status, data: { error } }
      : getFileInfoResponse({ uri, db, query, host });
  });

  /**
   * GET (download).
   */
  router.get(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryGetCellFile;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error
      ? { status, data: { error } }
      : getFileDownloadResponse({ db, fs, uri, host, query });
  });

  /**
   * POST binary-file.
   */
  router.post(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryPostFile;
    const { status, ns, error, uri } = getParams(req);
    if (!ns || error) {
      return { status, data: { error } };
    } else {
      const form = await req.body.form();

      if (form.files.length === 0) {
        const err = new Error(`No file data was posted to the URI ("${uri}").`);
        return util.toErrorPayload(err, { status: 400 });
      }
      if (form.files.length > 1) {
        const err = new Error(`Only a single file can be posted to the URI ("${uri}").`);
        return util.toErrorPayload(err, { status: 400 });
      }

      const file = form.files[0];
      return postFileResponse({ db, fs, uri, query, file, host });
    }
  });

  /**
   * DELETE binary-file.
   */
  router.delete(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryDeleteFile;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error
      ? { status, data: { error } }
      : deleteFileResponse({ fs, uri, db, query, host });
  });
}

/**
 * [Methods]
 */

export const getFileDownloadResponse = async (args: {
  db: t.IDb;
  fs: t.IFileSystem;
  uri: string;
  host: string;
  query?: t.IUrlQueryGetFile;
}) => {
  const { db, fs, uri, host, query = {} } = args;

  try {
    // Pull the file meta-data.
    const fileResponse = await getFileInfoResponse({ uri, db, query, host });
    if (!util.isOK(fileResponse.status)) {
      return fileResponse; // NB: This is an error.
    }
    const file = fileResponse.data as t.IResGetFile;

    // Match hash if requested.
    if (query.hash && file.data.hash !== query.hash) {
      const err = new Error(`"${file.uri}" hash does not match requested hash.`);
      return util.toErrorPayload(err, { status: 409, type: ERROR.HTTP.HASH_MISMATCH });
    }

    // Ensure the file exists.
    if (!file.exists) {
      const err = new Error(`"${file.uri}" does not exist.`);
      return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
    }

    // Get the location.
    const props = file.data.props;
    const location = (props.location || '').trim();
    if (!location) {
      const err = new Error(`"${file.uri}" does not have a location.`);
      return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
    }

    // Redirect if the location is an S3 link.
    if (util.isHttp(location)) {
      return { status: 307, data: location };
    }

    // Serve the file if local file-system.
    if (util.isFile(location) && fs.type === 'FS') {
      const local = await fs.read(uri);
      const data = local.file ? local.file.data : undefined;
      if (!data) {
        const err = new Error(`File at the URI "${file.uri}" does on the local file-system.`);
        return util.toErrorPayload(err, { status: 404, type: ERROR.HTTP.NOT_FOUND });
      } else {
        return { status: 200, data };
      }
    }

    // Something went wrong if we got this far.
    const err = new Error(`File at the URI "${file.uri}" could not be served.`);
    return util.toErrorPayload(err, { status: 500 });
  } catch (err) {
    return util.toErrorPayload(err);
  }
};

export async function getFileInfoResponse(args: {
  db: t.IDb;
  uri: string;
  host: string;
  query?: t.IReqFileInfoQuery;
}): Promise<t.IPayload<t.IResGetFile> | t.IErrorPayload> {
  const { db, uri, query = {}, host } = args;
  try {
    const model = await models.File.create({ db, uri }).ready;
    const exists = Boolean(model.exists);
    const { createdAt, modifiedAt } = model;
    const data = util.squash.object(model.toObject()) || {};
    const res = {
      uri,
      exists,
      createdAt,
      modifiedAt,
      data,
      urls: util.urls(host).file(uri),
    };
    return { status: 200, data: res as t.IResGetFile };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}

export async function postFileResponse(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  uri: string;
  file: t.IFormFile;
  host: string;
  query?: t.IUrlQueryPostFile;
}): Promise<t.IPayload<t.IResPostFile> | t.IErrorPayload> {
  const { db, uri, query = {}, file, fs, host } = args;
  const sendChanges = defaultValue(query.changes, true);
  let changes: t.IDbModelChange[] = [];

  try {
    // Save to the abstract file-system (S3 or local).
    const { buffer } = file;
    const filename = file.name;
    const writeResponse = await fs.write(uri, buffer);
    const filehash = writeResponse.file.hash;
    const location = writeResponse.location;
    const bytes = Uint8Array.from(buffer).length;

    // Save the model.
    const model = await models.File.create({ db, uri }).ready;
    models.setProps(model, { filename, filehash, location, bytes });
    const saveResponse = await model.save();

    // Store DB changes.
    if (sendChanges) {
      changes = [...changes, ...models.toChanges(uri, saveResponse.changes)];
    }

    // Finish up.
    const fileResponse = await getFileInfoResponse({ uri, db, query, host });
    const { status } = fileResponse;
    const fileResponseData = fileResponse.data as t.IResGetFile;
    const res: t.IPayload<t.IResPostFile> = {
      status,
      data: {
        ...fileResponseData,
        changes: sendChanges ? changes : undefined,
      },
    };

    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}

export async function deleteFileResponse(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  uri: string;
  host: string;
  query?: t.IUrlQueryDeleteFile;
}): Promise<t.IPayload<t.IResDeleteFile> | t.IErrorPayload> {
  const { db, fs, uri } = args;

  try {
    // Delete the file from disk.
    const resDeleteFile = await fs.delete(uri);
    const fsError = resDeleteFile.error;
    if (fsError) {
      const { type } = fsError;
      return util.toErrorPayload(fsError.message, { type });
    }

    // Delete the model.
    const model = await models.File.create({ db, uri }).ready;
    await model.delete();

    const res: t.IPayload<t.IResDeleteFile> = {
      status: 200,
      data: { deleted: true, uri },
    };
    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}

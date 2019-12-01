import { defaultValue, constants, ROUTES, Schema, t, models, util } from '../common';

/**
 * File-system routes (fs:).
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, fs, router } = args;

  const getParams = (req: t.Request) => {
    const params = req.params as t.IReqFileParams;
    const data = {
      ns: (params.ns || '').toString(),
      file: (params.file || '').toString(),
      uri: '',
    };

    const error: t.IError = {
      type: constants.ERROR.MALFORMED_URI,
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
   * GET file (model).
   */
  router.get(ROUTES.FILE.BASE, async req => {
    const query = req.query as t.IReqFileQuery;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error ? { status, data: { error } } : getFileResponse({ uri, db, query });
  });

  /**
   * GET /pull (download).
   */
  router.get(ROUTES.FILE.PULL, async req => {
    const query = req.query as t.IReqFilePullQuery;
    const { status, ns, error, uri } = getParams(req);

    if (!ns || error) {
      return { status, data: { error } };
    }

    try {
      // Pull the file meta-data.
      const fileResponse = await getFileResponse({ uri, db, query });
      if (!util.isOK(fileResponse.status)) {
        return fileResponse; // NB: This is an error.
      }
      const file = fileResponse.data as t.IResGetFile;

      // Ensure the file exists.
      if (!file.exists) {
        const err = new Error(`File at the URI "${file.uri}" does not exist.`);
        return util.toErrorPayload(err, { status: 404, type: 'HTTP/notFound' });
      }

      // Get the location.
      const props = file.data.props;
      const location = (props.location || '').trim();
      if (!location) {
        const err = new Error(`File at the URI "${file.uri}" does not have a location.`);
        return util.toErrorPayload(err, { status: 404, type: 'HTTP/notFound' });
      }

      // Prepare headers that cause the browser's save-dialog to default to the file-name.
      const headers = {
        'Content-Disposition': `inline; filename="${props.name}"`,
      };

      // Redirect if the location is an S3 link.
      if (util.isHttp(location)) {
        return { status: 307, data: location, headers };
      }

      // Serve the file if local file-system.
      if (util.isFile(location) && fs.type === 'FS') {
        const local = await fs.read(uri);
        const data = local.file ? local.file.data : undefined;
        if (!data) {
          const err = new Error(`File at the URI "${file.uri}" does on the local file-system.`);
          return util.toErrorPayload(err, { status: 404, type: 'HTTP/notFound' });
        } else {
          return { status: 200, data, headers };
        }
      }

      // Something went wrong if we got this far.
      const err = new Error(`File at the URI "${file.uri}" could not be served.`);
      return util.toErrorPayload(err, { status: 500 });
    } catch (err) {
      return util.toErrorPayload(err);
    }
  });

  /**
   * POST binary-file.
   */
  router.post(ROUTES.FILE.BASE, async req => {
    const query = req.query as t.IReqPostFileQuery;
    const { status, ns, error, uri } = getParams(req);
    if (!ns || error) {
      return { status, data: { error } };
    }
    const form = await req.body.form();
    return postFileResponse({ db, fs, uri, query, form });
  });
}

/**
 * [Helpers]
 */

export async function getFileResponse(args: { db: t.IDb; uri: string; query?: t.IReqFileQuery }) {
  const { db, uri, query = {} } = args;
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
  form: t.IForm;
  query?: t.IReqPostFileQuery;
}) {
  const { db, uri, query = {}, form, fs } = args;
  const sendChanges = defaultValue(query.changes, true);
  let changes: t.IDbModelChange[] = [];

  try {
    if (form.files.length === 0) {
      const err = new Error(`No file data was posted to the URI ("${uri}").`);
      return util.toErrorPayload(err, { status: 400 });
    }
    if (form.files.length > 1) {
      const err = new Error(`Only a single file can be posted to the URI ("${uri}").`);
      return util.toErrorPayload(err, { status: 400 });
    }

    // Save to the abstract file-system (S3 or local).
    const file = form.files[0];
    const { buffer, name, encoding } = file;
    const writeResponse = await fs.write(uri, buffer);
    const fileHash = writeResponse.file.hash;
    const location = writeResponse.location;

    // Save the model.
    const model = await models.File.create({ db, uri }).ready;
    models.setProps(model, { name, encoding, fileHash, location });
    const saveResponse = await model.save();

    // Store DB changes.
    if (sendChanges) {
      changes = [...changes, ...models.toChanges(uri, saveResponse.changes)];
    }

    // Finish up.
    const fileResponse = await getFileResponse({ uri, db, query });
    const res = sendChanges
      ? {
          ...fileResponse,
          data: { ...fileResponse.data, changes },
        }
      : fileResponse;

    return res;
  } catch (err) {
    return util.toErrorPayload(err);
  }
}

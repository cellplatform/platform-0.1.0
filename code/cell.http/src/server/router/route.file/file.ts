import {
  defaultValue,
  constants,
  ROUTES,
  Schema,
  t,
  toErrorPayload,
  models,
  util,
} from '../common';

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
   * POST binary-file.
   */
  router.post(ROUTES.FILE.BASE, async req => {
    const query = req.query as t.IReqPostFileQuery;
    const { status, ns, error, uri } = getParams(req);
    if (!ns || error) {
      return { status, data: { error } };
    } else {
      const form = await req.body.form();
      return postFileResponse({ db, fs, uri, query, form });
    }
  });
}

/**
 * [Helpers]
 */

export async function getFileResponse(args: { db: t.IDb; uri: string; query: t.IReqFileQuery }) {
  const { db, uri } = args;
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
    return toErrorPayload(err);
  }
}

export async function postFileResponse(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  uri: string;
  query: t.IReqPostFileQuery;
  form: t.IForm;
}) {
  const { db, uri, query, form, fs } = args;
  const sendChanges = defaultValue(query.changes, true);
  let changes: t.IDbModelChange[] = [];

  try {
    if (form.files.length === 0) {
      const err = new Error(`No file data was posted to the URI ("${uri}").`);
      return toErrorPayload(err, { status: 400 });
    }
    if (form.files.length > 1) {
      const err = new Error(`Only a single file can be posted to the URI ("${uri}").`);
      return toErrorPayload(err, { status: 400 });
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
    return toErrorPayload(err);
  }
}

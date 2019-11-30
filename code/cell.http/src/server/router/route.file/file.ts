import { constants, ROUTES, Schema, t, toErrorPayload, models, util } from '../common';

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
    // const getModel: t.GetModel = () => null as any;
    return !ns || error ? { status, data: { error } } : getFileResponse({ uri, db });
  });

  /**
   * POST binary-file.
   */
  router.post(ROUTES.FILE.BASE, async req => {
    const query = req.query as t.IReqPostFileQuery;
    const { status, ns, error, uri } = getParams(req);
    // const getModel: t.GetModel = () => null as any;

    if (!ns || error) {
      return { status, data: { error } };
    }

    const data = await req.body.form();

    for (const item of data.files) {
      // TODO 🐷
      /**
       * TODO 🐷
       * - sha
       */

      const { mimetype, buffer, name, encoding } = item;

      const fileHash = util.hash.sha256(buffer);

      const r = await fs.write(uri, item.buffer);

      console.log('fileHash', fileHash);
    }

    return error ? { status, data: { error } } : getFileResponse({ uri, db });

    // return { data: { foo: 123 } };
  });
}

/**
 * [Helpers]
 */

export async function getFileResponse(args: { db: t.IDb; uri: string }) {
  const { db, uri } = args;
  try {
    // TODO 🐷

    const model = await models.File.create({ db, uri }).ready;
    const exists = Boolean(model.exists);
    const { createdAt, modifiedAt } = model;

    // const data = cell.value.squash.object(model.toObject()) || {};
    const data = {};

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

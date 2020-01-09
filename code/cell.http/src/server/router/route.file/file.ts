import { constants, routes, Schema, t } from '../common';
import { deleteFileResponse } from './file.delete';
import { getFileDownloadResponse } from './file.download';
import { getFileInfoResponse } from './file.info';
import { postFileVerifiedResponse } from './file.verify';

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
   * GET (file info/meta).
   */
  router.get(routes.FILE.INFO, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileInfo;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error
      ? { status, data: { error } }
      : getFileInfoResponse({ uri, db, query, host });
  });

  /**
   * GET (file download).
   */
  router.get(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileDownload;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error
      ? { status, data: { error } }
      : getFileDownloadResponse({ db, fs, uri, host, query });
  });

  /**
   * POST (file verify)
   */
  router.post(routes.FILE.VERIFIED, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileVerified;
    const body = await req.body.json<t.IReqPostFileVerifiedBody>({ default: { overwrite: false } });

    const { status, ns, error, uri } = getParams(req);
    const { overwrite } = body;
    return !ns || error
      ? { status, data: { error } }
      : postFileVerifiedResponse({ db, fs, uri, host, query, overwrite });
  });

  /**
   * TODO 🐷
   * - delete commented out POST
   * - ensure URL/types have also been deleted
   * - ensure ROUTE is deleted.
   */

  /**
   * POST binary-file.
   */
  // router.post(routes.FILE.BASE, async req => {
  //   const host = req.host;
  //   const query = req.query as t.IUrlQueryPostFile;
  //   const { status, ns, error, uri } = getParams(req);
  //   if (!ns || error) {
  //     return { status, data: { error } };
  //   } else {
  //     const form = await req.body.form();

  //     if (form.files.length === 0) {
  //       const err = new Error(`No file data was posted to the URI ("${uri}").`);
  //       return util.toErrorPayload(err, { status: 400 });
  //     }
  //     if (form.files.length > 1) {
  //       const err = new Error(`Only a single file can be posted to the URI ("${uri}").`);
  //       return util.toErrorPayload(err, { status: 400 });
  //     }

  //     const file = form.files[0];
  //     return postFileResponse({ db, fs, uri, query, file, host });
  //   }
  // });

  /**
   * DELETE binary-file.
   */
  router.delete(routes.FILE.BASE, async req => {
    const host = req.host;
    const query = req.query as t.IUrlQueryFileDelete;
    const { status, ns, error, uri } = getParams(req);
    return !ns || error
      ? { status, data: { error } }
      : deleteFileResponse({ fs, uri, db, query, host });
  });
}

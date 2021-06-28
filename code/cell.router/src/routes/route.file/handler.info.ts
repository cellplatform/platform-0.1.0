import { models, t, util, Schema } from '../common';

export async function fileInfo(args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  fileUri: string;
}): Promise<t.IPayload<t.IResGetFile> | t.IErrorPayload> {
  const { db, fs, fileUri: uri, host } = args;
  try {
    const model = await models.File.create({ db, uri }).ready;
    const exists = Boolean(model.exists);
    const { createdAt, modifiedAt } = model;
    const data = (Schema.Squash.object(model.toObject()) || {}) as t.IFileData;

    // Ensure the saved file location is an absolute path.
    // NB: When stored in the local file-system the root directory is
    //     trimmed off and replaced with the home prefix ("~").
    if (fs.type === 'LOCAL') {
      const path = data.props?.location;
      if (path?.startsWith('file://~')) {
        const root = fs.dir;
        data.props.location = Schema.File.Path.Local.toAbsoluteLocation({ path, root });
      }
    }

    const res = {
      uri,
      exists,
      createdAt,
      modifiedAt,
      data,
      urls: util.urls(host).file(uri),
    };
    const status = exists ? 200 : 404;
    return { status, data: res as t.IResGetFile };
  } catch (err) {
    return util.toErrorPayload(err);
  }
}
